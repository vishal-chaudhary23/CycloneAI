# 🌪️ Cyclone Intelligence AI

### AI-Based Tropical Cyclone Forecasting & India-Focused Risk Assessment

**Team AIMERS | Smart India Hackathon 2026**

Cyclone Intelligence AI is an AI/ML-based decision-support system designed to analyze tropical cyclone evolution and generate multi-horizon track and intensity forecasts, rapid intensification predictions, predictive uncertainty, and India-focused proximity risk assessment through an interactive dashboard.

---

## 🚨 Problem

Tropical cyclones can rapidly change their track, intensity, and structure, making accurate forecasting challenging. Longer forecast horizons introduce greater uncertainty, while raw satellite and cyclone data can be difficult to interpret for decision-making.

There is a need for a system that can combine historical cyclone observations with AI-based forecasting and present the results in an accessible, India-focused interface.

---

## 💡 Proposed Solution

**Cyclone Intelligence AI** combines:

- 🛰️ Multi-channel satellite observations
- 🧭 Historical cyclone motion and velocity
- 🧠 Spatial and temporal AI/ML models
- 📈 Multi-horizon forecasting
- ⚠️ Rapid Intensification detection
- 📐 Predictive uncertainty estimation
- 🇮🇳 India-focused proximity risk assessment
- 🗺️ Interactive visualization

The system transforms cyclone observations into understandable forecasts and decision-support information.

---

# 🔄 System Workflow

```text
Satellite Observations
        │
        ▼
Data Preprocessing
        │
        ▼
Temporal Sequence Construction
        │
        ▼
AI / ML Models
        │
        ├──────────────┬──────────────┐
        ▼              ▼              ▼
   Track Forecast  Intensity       RI Detection
                    Forecast
        │              │              │
        └──────────────┼──────────────┘
                       ▼
             Uncertainty Estimation
                       │
                       ▼
              India Risk Assessment
                       │
                       ▼
               Forecast Results
                       │
                       ▼
              React + Leaflet UI
                       │
                       ▼
              Decision Support
```

---

# 🛰️ Dataset

The current experiments use the **TCIR Indian Ocean subset**.

| Parameter | Value |
|---|---:|
| Cyclones | 75 |
| Satellite frames | 3,205 |
| Channels | 4 |
| Image size | 201 × 201 |
| Temporal interval | 3 hours |
| Temporal window | 5 frames |
| Historical context | ~15 hours |
| Forecast horizons | +6h, +12h, +18h, +24h |

The five-frame temporal window is used to capture the recent evolution and motion of the cyclone.

---

# 🧠 AI / ML Approach

## Track Forecasting

The system predicts future cyclone displacement:

```text
ΔLatitude
ΔLongitude
```

These predicted displacements are converted into future geographic coordinates.

The best short-term track experiment achieved a mean error of **26.04 km at +6 hours**.

## Intensity Forecasting

The system predicts cyclone maximum wind speed (`Vmax`) in knots.

The best current intensity experiment achieved an MAE of approximately **3.31 kt**.

## Rapid Intensification

RI is defined in the current experiments as:

```text
Increase in Vmax ≥ 30 kt within 24 hours
```

---

# 📊 Current Results

## Track Forecasting

| Method | +6h Mean Error |
|---|---:|
| Persistence | 63.99 km |
| Motion Trend | 27.76 km |
| **Best AI Model** | **26.04 km** |

### Multi-Horizon Track Error

| Horizon | Mean Error |
|---|---:|
| +6h | **26.04 km** |
| +12h | **57.26 km** |
| +18h | **91.22 km** |
| +24h | **128.58 km** |

The increase in error with forecast horizon reflects the increasing uncertainty of longer-term cyclone trajectory prediction.

## Intensity Forecasting

**Best current MAE: 3.31 kt**

The current experiments indicate that metadata/motion information was highly effective for intensity prediction. Satellite imagery did not demonstrate a clear improvement over metadata-only prediction in the current setup.

## Rapid Intensification Detection

| Metric | Score |
|---|---:|
| ROC-AUC | 0.6113 |
| PR-AUC | 0.2383 |
| F1 | 0.3011 |

RI detection remains an area for further improvement because of class imbalance and limited positive samples.

---

# 📐 Predictive Uncertainty

The system provides **model-derived predictive spread** alongside track forecasts.

| Horizon | Predictive Spread |
|---|---:|
| +6h | 10.65 km |
| +12h | 19.90 km |
| +18h | 29.18 km |
| +24h | 40.95 km |

> These values represent model-derived predictive spread and should not be interpreted as guaranteed confidence radii or forecast accuracy.

---

# 🇮🇳 India Risk Assessment

The system calculates the distance between predicted cyclone locations and India's coastline.

The current prototype uses:

```text
< 100 km       → Very High
100–250 km     → High
250–500 km     → Moderate
> 500 km       → Low
```

> **Note:** These are prototype decision-support thresholds and are not official IMD warning thresholds.

---

# 🖥️ Interactive Dashboard

The React-based dashboard provides:

### Track View

- Historical cyclone trajectory
- AI forecast trajectory
- Current cyclone position
- +6h / +12h / +18h / +24h forecast points
- Predictive spread

### India View

- India-focused geographical context
- Cyclone trajectory
- Proximity-based risk visualization

### Forecast Timeline

Displays forecast evolution across:

```text
+6h → +12h → +18h → +24h
```

including predicted position, intensity and risk information.

### Dashboard Features

- Cyclone selection
- Forecast initialization
- Current cyclone state
- Track View
- India View
- Forecast timeline
- Intensity prediction
- Risk assessment
- Predictive uncertainty
- Model performance visualization

---

# 🛠️ Technology Stack

### Frontend
- React
- Vite
- JavaScript
- HTML
- CSS
- Leaflet
- React-Leaflet
- Papa Parse

### AI / Machine Learning
- Python
- TensorFlow
- Keras
- CNN
- GRU
- Scikit-learn

### Data Processing
- NumPy
- Pandas
- h5py
- HDF5

### Geospatial Processing
- GeoPandas
- Shapely
- PyProj

### Visualization
- Matplotlib

### Development
- VS Code
- WSL / Ubuntu
- NVIDIA GPU
- Git
- GitHub

---

# 📁 Project Structure

```text
CycloneAI/
│
├── data/
│   ├── tcir_io.h5
│   ├── tcir_io_metadata.csv
│   └── ...
│
├── notebooks/
│   └── ...
│
├── src/
│   ├── model/
│   │   ├── velocity_only_track_best.keras
│   │   ├── multistep_track_best.keras
│   │   └── ...
│   │
│   └── ...
│
├── scripts/
│   └── ...
│
├── reports/
│   ├── final_forecast_results.csv
│   ├── track_results.json
│   ├── ri_results.json
│   └── multistep_results.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── requirements.txt
├── .gitignore
└── README.md
```

> Large datasets and model files may be excluded from Git using `.gitignore`.

---

# ⚙️ Installation

## Clone the repository

```bash
git clone https://github.com/vishal-chaudhary23/CycloneAI.git
cd CycloneAI
```

## Create Python environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## Install dependencies

```bash
pip install -r requirements.txt
```

---

# 🖥️ Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local URL provided by Vite.

---

# 🔮 Future Scope

### More Satellite Data

- INSAT-3D
- INSAT-3DR
- MOSDAC satellite products
- Additional historical cyclone datasets

### Environmental Variables

Future versions can incorporate:

- Sea Surface Temperature
- Vertical Wind Shear
- Atmospheric Humidity
- Atmospheric Pressure
- Other environmental predictors

### Advanced AI

Potential improvements include:

- ConvLSTM
- Vision Transformers
- Temporal Transformers
- Multimodal fusion
- Ensemble forecasting
- Improved uncertainty estimation

### Operational Deployment

```text
Live Satellite Data
        ↓
Automated Processing
        ↓
AI Forecast
        ↓
Uncertainty Estimation
        ↓
India Risk Assessment
        ↓
Decision Support Dashboard
```

---

# ⚠️ Current Limitations

- Current experiments use a limited Indian Ocean dataset of 75 cyclones.
- Track error increases significantly at longer forecast horizons.
- RI detection requires further improvement.
- Current experiments do not establish that satellite imagery improves track or intensity prediction over motion/metadata-only models.
- India risk thresholds are prototype decision-support thresholds.
- The system is currently a research prototype and not an operational cyclone warning service.

---

# 🎯 Vision

Cyclone Intelligence AI aims to transform complex cyclone observations into accessible forecasting and risk information:

```text
Satellite Observation
        ↓
AI Forecasting
        ↓
Uncertainty Estimation
        ↓
India-Focused Risk
        ↓
Actionable Decision Support
```

### **Predict • Prepare • Protect**

---

# 👥 Team AIMERS

## Cyclone Intelligence AI

**Smart India Hackathon 2026**

> *From Satellite Data to Safer Tomorrows*
