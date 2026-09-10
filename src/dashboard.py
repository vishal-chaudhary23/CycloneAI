import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
import geopandas as gpd

# --------------------------------------------------
# CONFIG
# --------------------------------------------------

st.set_page_config(
    page_title="Cyclone Intelligence AI",
    page_icon="🌀",
    layout="wide"
)

# --------------------------------------------------
# SIDEBAR CARD STYLE
# --------------------------------------------------

st.markdown(
    """
    <style>

    .sidebar-info {
        margin-top: 55px;
    }

    .info-card {
        background: #1b222d;
        border: 1px solid #2a3340;
        border-radius: 12px;

        padding: 28px 15px;

        margin-bottom: 25px;

        text-align: center;
    }

    .info-card span {
        display: block;

        color: #8fa1b8;

        font-size: 17px;

        margin-bottom: 28px;
    }

    .info-card strong {
        display: block;

        color: #ffffff;

        font-size: 21px;

        font-weight: 700;
    }

    </style>
    """,
    unsafe_allow_html=True
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
# INDIA MAP DATA
# --------------------------------------------------

@st.cache_data
def load_india_map():

    url = (
        "https://raw.githubusercontent.com/"
        "nvkelso/natural-earth-vector/master/"
        "geojson/ne_110m_admin_0_countries.geojson"
    )

    world = gpd.read_file(url)

    india = world[
        world["ADMIN"] == "India"
    ]

    return world, india


world, india = load_india_map()

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
    "Forecast Initialization",
    0,
    len(cyclone_df) - 1,
    0
)

sample = cyclone_df.iloc[row_idx]

forecast_time = pd.to_datetime(sample["target_time"])

st.sidebar.caption(
    f"Time: {forecast_time.strftime('%d %b %Y, %H:%M UTC')}"
)

# --------------------------------------------------
# SIDEBAR FORECAST INFO
# --------------------------------------------------

st.sidebar.markdown("")

with st.sidebar.container(border=True):
    st.markdown(
        "<div style='text-align:center; color:#8fa1b8; font-size:17px;'>"
        "Forecast Horizon</div>",
        unsafe_allow_html=True
    )
    st.markdown(
        "<div style='text-align:center; font-size:21px; font-weight:700;'>"
        "24 Hours</div>",
        unsafe_allow_html=True
    )

st.sidebar.markdown("")

with st.sidebar.container(border=True):
    st.markdown(
        "<div style='text-align:center; color:#8fa1b8; font-size:17px;'>"
        "Prediction Steps</div>",
        unsafe_allow_html=True
    )
    st.markdown(
        "<div style='text-align:center; font-size:21px; font-weight:700;'>"
        "6h / 12h / 18h / 24h</div>",
        unsafe_allow_html=True
    )

st.sidebar.markdown("")

with st.sidebar.container(border=True):
    st.markdown(
        "<div style='text-align:center; color:#8fa1b8; font-size:17px;'>"
        "Input History</div>",
        unsafe_allow_html=True
    )
    st.markdown(
        "<div style='text-align:center; font-size:21px; font-weight:700;'>"
        "5 Satellite Frames</div>",
        unsafe_allow_html=True
    )
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


# --------------------------------------------------
# HISTORICAL TRACK
# --------------------------------------------------

history_lat = np.array(
    [float(x) for x in sample["lat_history"].strip("[]").split(",")]
)

history_lon = np.array(
    [float(x) for x in sample["lon_history"].strip("[]").split(",")]
)


# --------------------------------------------------
# AI FORECAST
# --------------------------------------------------

forecast_lat = np.array([
    sample["lat_6h"],
    sample["lat_12h"],
    sample["lat_18h"],
    sample["lat_24h"]
], dtype=float)

forecast_lon = np.array([
    sample["lon_6h"],
    sample["lon_12h"],
    sample["lon_18h"],
    sample["lon_24h"]
], dtype=float)


# --------------------------------------------------
# UNCERTAINTY
# --------------------------------------------------

uncertainty_km = np.array([
    10.65,
    19.90,
    29.18,
    40.95
])


# Convert uncertainty from km → degrees
lat_radius = uncertainty_km / 111.0

lon_radius = uncertainty_km / (
    111.0 *
    np.cos(np.radians(forecast_lat))
)


# --------------------------------------------------
# CREATE MAP
# --------------------------------------------------

map_view = st.segmented_control(
    "Map View",
    ["Track View", "India View"],
    default="Track View"
)

fig, ax = plt.subplots(
    figsize=(12, 7)
)


# --------------------------------------------------
# TRACK VIEW
# --------------------------------------------------

if map_view == "Track View":

    # ----------------------------------------------
    # Historical Track
    # ----------------------------------------------

    ax.plot(
        history_lon,
        history_lat,
        marker="o",
        linewidth=3,
        markersize=7,
        color="#1976D2",
        label="Historical Track",
        zorder=5
    )


    # ----------------------------------------------
    # Current Position
    # ----------------------------------------------

    ax.scatter(
        history_lon[-1],
        history_lat[-1],
        marker="*",
        s=350,
        color="#1565C0",
        edgecolor="white",
        linewidth=1.5,
        label="Current Position",
        zorder=8
    )


    # ----------------------------------------------
    # Current → Forecast
    # ----------------------------------------------

    forecast_path_lon = np.concatenate([
        [history_lon[-1]],
        forecast_lon
    ])

    forecast_path_lat = np.concatenate([
        [history_lat[-1]],
        forecast_lat
    ])


    ax.plot(
        forecast_path_lon,
        forecast_path_lat,
        linestyle="--",
        linewidth=3,
        color="#F57C00",
        label="AI Forecast",
        zorder=6
    )


    # ----------------------------------------------
    # Forecast + Uncertainty
    # ----------------------------------------------

    for i, (lon, lat, rx, ry) in enumerate(
        zip(
            forecast_lon,
            forecast_lat,
            lon_radius,
            lat_radius
        )
    ):

        theta = np.linspace(
            0,
            2 * np.pi,
            100
        )


        ellipse_lon = (
            lon +
            rx * np.cos(theta)
        )

        ellipse_lat = (
            lat +
            ry * np.sin(theta)
        )


        # Uncertainty

        ax.fill(
            ellipse_lon,
            ellipse_lat,
            color="#7E57C2",
            alpha=0.12,
            edgecolor="#7E57C2",
            linewidth=1,
            zorder=3
        )


        # Forecast point

        ax.scatter(
            lon,
            lat,
            s=110,
            color="#F57C00",
            edgecolor="white",
            linewidth=1.2,
            zorder=7
        )


        # Label

        horizon = (i + 1) * 6

        ax.annotate(
            f"+{horizon}h",
            (lon, lat),
            xytext=(10, 8),
            textcoords="offset points",
            fontsize=13,
            fontweight="bold"
        )


    # ----------------------------------------------
    # Tight Zoom
    # ----------------------------------------------

    all_lat = np.concatenate([
        history_lat,
        forecast_lat
    ])

    all_lon = np.concatenate([
        history_lon,
        forecast_lon
    ])


    ax.set_xlim(
        all_lon.min() - 1.5,
        all_lon.max() + 1.5
    )

    ax.set_ylim(
        all_lat.min() - 1.5,
        all_lat.max() + 1.5
    )


    ax.set_aspect("auto")


    ax.set_title(
        f"AI Cyclone Track Forecast — {selected_cyclone}",
        fontsize=18,
        fontweight="bold"
    )


# --------------------------------------------------
# INDIA VIEW
# --------------------------------------------------

else:

    # ----------------------------------------------
    # World boundaries
    # ----------------------------------------------

    world.boundary.plot(
        ax=ax,
        linewidth=0.5,
        color="gray",
        alpha=0.5
    )


    # ----------------------------------------------
    # India
    # ----------------------------------------------

    india.plot(
        ax=ax,
        facecolor="#f2f2f2",
        edgecolor="black",
        linewidth=1.2
    )


    # ----------------------------------------------
    # Historical Track
    # ----------------------------------------------

    ax.plot(
        history_lon,
        history_lat,
        marker="o",
        linewidth=3,
        markersize=6,
        color="#1976D2",
        label="Historical Track",
        zorder=5
    )


    # ----------------------------------------------
    # Current Position
    # ----------------------------------------------

    ax.scatter(
        history_lon[-1],
        history_lat[-1],
        marker="*",
        s=350,
        color="#1565C0",
        edgecolor="white",
        linewidth=1.5,
        label="Current Position",
        zorder=8
    )


    # ----------------------------------------------
    # Forecast
    # ----------------------------------------------

    forecast_path_lon = np.concatenate([
        [history_lon[-1]],
        forecast_lon
    ])

    forecast_path_lat = np.concatenate([
        [history_lat[-1]],
        forecast_lat
    ])


    ax.plot(
        forecast_path_lon,
        forecast_path_lat,
        linestyle="--",
        linewidth=3,
        color="#F57C00",
        label="AI Forecast",
        zorder=6
    )


    # ----------------------------------------------
    # Forecast Points
    # ----------------------------------------------

    for i, (lon, lat, rx, ry) in enumerate(
        zip(
            forecast_lon,
            forecast_lat,
            lon_radius,
            lat_radius
        )
    ):

        theta = np.linspace(
            0,
            2 * np.pi,
            100
        )


        ellipse_lon = (
            lon +
            rx * np.cos(theta)
        )

        ellipse_lat = (
            lat +
            ry * np.sin(theta)
        )


        ax.fill(
            ellipse_lon,
            ellipse_lat,
            color="#7E57C2",
            alpha=0.12,
            edgecolor="#7E57C2",
            linewidth=1,
            zorder=3
        )


        ax.scatter(
            lon,
            lat,
            s=100,
            color="#F57C00",
            edgecolor="white",
            linewidth=1.2,
            zorder=7
        )


        horizon = (i + 1) * 6

        ax.annotate(
            f"+{horizon}h",
            (lon, lat),
            xytext=(8, 8),
            textcoords="offset points",
            fontsize=12,
            fontweight="bold"
        )


    # ----------------------------------------------
    # Geographic Labels
    # ----------------------------------------------

    ax.text(
        72,
        10,
        "Arabian Sea",
        fontsize=13,
        style="italic",
        alpha=0.7
    )


    ax.text(
        87,
        12,
        "Bay of Bengal",
        fontsize=13,
        style="italic",
        alpha=0.7
    )


    # ----------------------------------------------
    # India View Extent
    # ----------------------------------------------

    ax.set_xlim(
        65,
        100
    )

    ax.set_ylim(
        5,
        27
    )


    ax.set_aspect("auto")


    ax.set_title(
        f"India Regional Cyclone Forecast — {selected_cyclone}",
        fontsize=18,
        fontweight="bold"
    )


# --------------------------------------------------
# COMMON STYLE
# --------------------------------------------------

ax.set_xlabel(
    "Longitude",
    fontsize=12
)

ax.set_ylabel(
    "Latitude",
    fontsize=12
)

ax.grid(
    True,
    alpha=0.25
)

ax.legend(
    loc="upper right"
)

plt.tight_layout()

st.pyplot(
    fig,
    use_container_width=True
)

plt.close(fig)

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


# Force correct chronological order
uncertainty_table["Horizon"] = pd.Categorical(
    uncertainty_table["Horizon"],
    categories=["+6h", "+12h", "+18h", "+24h"],
    ordered=True
)

uncertainty_table = uncertainty_table.sort_values(
    "Horizon"
)


st.bar_chart(
    uncertainty_table,
    x="Horizon",
    y="Mean Uncertainty (km)"
)

# --------------------------------------------------
# FOOTER
# --------------------------------------------------

st.divider()

st.caption(
    "SIH 2026 Prototype | Cyclone Intelligence AI"
)

