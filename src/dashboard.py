import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path


# --------------------------------------------------
# CONFIG
# --------------------------------------------------

st.set_page_config(
    page_title="Cyclone Intelligence AI",
    page_icon="🌀",
    layout="wide"
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent

DATA_PATH = PROJECT_ROOT / "reports" / "final_forecast_results.csv"

# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

@st.cache_data
def load_data():
    df = pd.read_csv(DATA_PATH)
    df["target_time"] = pd.to_datetime(df["target_time"])
    return df


df = load_data()


# --------------------------------------------------
# HEADER
# --------------------------------------------------

st.title("🌀 Cyclone Intelligence AI")
st.caption(
    "AI-based tropical cyclone track, intensity and risk forecasting"
)


# --------------------------------------------------
# SIDEBAR
# --------------------------------------------------

st.sidebar.header("Forecast Selection")

cyclones = sorted(df["ID"].unique())

selected_cyclone = st.sidebar.selectbox(
    "Cyclone",
    cyclones
)

cyclone_df = df[
    df["ID"] == selected_cyclone
].reset_index(drop=True)


row_idx = st.sidebar.slider(
    "Forecast time",
    0,
    len(cyclone_df) - 1,
    0
)

sample = cyclone_df.iloc[row_idx]


# --------------------------------------------------
# CURRENT CONDITIONS
# --------------------------------------------------

st.subheader("Current Cyclone State")

col1, col2, col3, col4 = st.columns(4)

current_lat = sample["lat_history"].strip("[]").split(",")[-1]
current_lon = sample["lon_history"].strip("[]").split(",")[-1]

with col1:
    st.metric(
        "Latitude",
        f"{float(current_lat):.2f}°"
    )

with col2:
    st.metric(
        "Longitude",
        f"{float(current_lon):.2f}°"
    )

with col3:
    st.metric(
        "Predicted +6h Intensity",
        f"{sample['vmax_6h']:.1f} kt"
    )

with col4:
    st.metric(
        "Current Risk",
        sample["risk_6h"]
    )


# --------------------------------------------------
# TRACK FORECAST
# --------------------------------------------------

st.subheader("AI Track Forecast")

history_lat = np.array(
    [float(x) for x in sample["lat_history"].strip("[]").split(",")]
)

history_lon = np.array(
    [float(x) for x in sample["lon_history"].strip("[]").split(",")]
)

forecast_lat = np.array([
    sample["lat_6h"],
    sample["lat_12h"],
    sample["lat_18h"],
    sample["lat_24h"]
])

forecast_lon = np.array([
    sample["lon_6h"],
    sample["lon_12h"],
    sample["lon_18h"],
    sample["lon_24h"]
])

fig, ax = plt.subplots(figsize=(10, 7))

# Historical
ax.plot(
    history_lon,
    history_lat,
    marker="o",
    linewidth=2,
    label="Historical"
)

# Forecast
ax.plot(
    forecast_lon,
    forecast_lat,
    marker="o",
    linestyle="--",
    linewidth=2,
    label="AI Forecast"
)

# Current position
ax.scatter(
    history_lon[-1],
    history_lat[-1],
    marker="*",
    s=180,
    label="Current"
)

# Uncertainty
uncertainty_km = np.array([
    10.65,
    19.90,
    29.18,
    40.95
])

lat_radius = uncertainty_km / 111.0

lon_radius = uncertainty_km / (
    111.0 * np.cos(np.radians(forecast_lat))
)

for lon, lat, rx, ry in zip(
    forecast_lon,
    forecast_lat,
    lon_radius,
    lat_radius
):

    theta = np.linspace(0, 2 * np.pi, 100)

    ellipse_lon = lon + rx * np.cos(theta)
    ellipse_lat = lat + ry * np.sin(theta)

    ax.fill(
        ellipse_lon,
        ellipse_lat,
        alpha=0.12
    )


# Labels
for lon, lat, h in zip(
    forecast_lon,
    forecast_lat,
    [6, 12, 18, 24]
):

    ax.annotate(
        f"+{h}h",
        (lon, lat),
        xytext=(6, 6),
        textcoords="offset points"
    )


# Zoom
all_lat = np.concatenate([
    history_lat,
    forecast_lat
])

all_lon = np.concatenate([
    history_lon,
    forecast_lon
])

ax.set_xlim(
    all_lon.min() - 3,
    all_lon.max() + 3
)

ax.set_ylim(
    all_lat.min() - 3,
    all_lat.max() + 3
)

ax.set_xlabel("Longitude")
ax.set_ylabel("Latitude")

ax.set_title(
    f"AI Cyclone Track Forecast — {selected_cyclone}"
)

ax.grid(True, alpha=0.3)
ax.legend()

st.pyplot(fig)


# --------------------------------------------------
# FORECAST TABLE
# --------------------------------------------------

st.subheader("Forecast Timeline")

forecast_table = pd.DataFrame({
    "Horizon": ["+6h", "+12h", "+18h", "+24h"],

    "Latitude": [
        sample["lat_6h"],
        sample["lat_12h"],
        sample["lat_18h"],
        sample["lat_24h"]
    ],

    "Longitude": [
        sample["lon_6h"],
        sample["lon_12h"],
        sample["lon_18h"],
        sample["lon_24h"]
    ],

    "Coast Distance (km)": [
        sample["coast_distance_6h_km"],
        sample["coast_distance_12h_km"],
        sample["coast_distance_18h_km"],
        sample["coast_distance_24h_km"]
    ],

    "Risk": [
        sample["risk_6h"],
        sample["risk_12h"],
        sample["risk_18h"],
        sample["risk_24h"]
    ]
})

st.dataframe(
    forecast_table,
    use_container_width=True,
    hide_index=True
)


# --------------------------------------------------
# MODEL PERFORMANCE
# --------------------------------------------------

st.subheader("Model Performance")

c1, c2, c3, c4 = st.columns(4)

with c1:
    st.metric(
        "6h Track Error",
        "26.04 km"
    )

with c2:
    st.metric(
        "12h Track Error",
        "57.26 km"
    )

with c3:
    st.metric(
        "18h Track Error",
        "91.22 km"
    )

with c4:
    st.metric(
        "24h Track Error",
        "128.58 km"
    )


# --------------------------------------------------
# UNCERTAINTY
# --------------------------------------------------

st.subheader("Predictive Uncertainty")

uncertainty_table = pd.DataFrame({
    "Horizon": ["+6h", "+12h", "+18h", "+24h"],
    "Mean Uncertainty (km)": [
        10.65,
        19.90,
        29.18,
        40.95
    ]
})

st.bar_chart(
    uncertainty_table.set_index("Horizon")
)


# --------------------------------------------------
# FOOTER
# --------------------------------------------------

st.divider()

st.caption(
    "SIH 2026 Prototype | Cyclone Intelligence AI"
)