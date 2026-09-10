# System Architecture

## High-level flow

```text
                    ┌──────────────────────────┐
                    │   Satellite Observations │
                    │   TCIR / INSAT Data      │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │    Data Preprocessing     │
                    │                          │
                    │ • Channel Processing      │
                    │ • Normalization           │
                    │ • Cyclone-wise Split      │
                    │ • Temporal Windows        │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │    Temporal AI Models    │
                    │                          │
                    │ CNN + GRU / Motion       │
                    │ Features                 │
                    └────────────┬─────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
       ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
       │ Track        │ │ Intensity    │ │ Rapid        │
       │ Forecast     │ │ Forecast     │ │ Intensification│
       └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌──────────────────────────┐
                    │ Uncertainty Estimation   │
                    │ & India Risk Assessment  │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │   Forecast Results CSV    │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │   React + Leaflet         │
                    │   Interactive Dashboard   │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Track • Intensity • Risk │
                    │ Uncertainty • Timeline   │
                    └──────────────────────────┘

```

## Components

### 1. Satellite Data

The system uses historical tropical cyclone satellite observations, primarily the TCIR Indian Ocean dataset.

- 3,205 satellite frames
- 75 Indian Ocean cyclones
- 4 channels
- 201 × 201 spatial resolution
- 3-hour temporal intervals

### 2. Data Preprocessing

The preprocessing pipeline prepares satellite and cyclone-motion information for model training.

- Satellite image/channel processing
- Normalization
- Cyclone-wise train/validation/test splitting
- Temporal sequence construction
- Five-frame temporal windows
- Cyclone motion and velocity feature preparation

### 3. Temporal AI Models

The experimental pipeline includes:

- CNN-based spatial feature extraction
- GRU-based temporal modeling
- Historical cyclone motion/velocity features
- Multi-horizon prediction

Forecast horizons: **+6h, +12h, +18h, +24h**.

### 4. Track Forecasting

The track model predicts future cyclone displacement:

```text
ΔLatitude
ΔLongitude
```

The predicted displacement is converted into future geographic coordinates.

**Best short-term track result: 26.04 km mean error at +6h.**

### 5. Intensity Forecasting

The system predicts cyclone maximum wind intensity (`Vmax`) in knots.

**Best current intensity experiment: approximately 3.31 kt MAE.**

### 6. Rapid Intensification Detection

Rapid Intensification (RI) is defined as:

```text
Increase in Vmax ≥ 30 kt within 24 hours
```

### 7. Uncertainty Estimation

Model-derived predictive spread is estimated alongside the track forecast to communicate forecast uncertainty across different horizons.

### 8. India Risk Assessment

The predicted cyclone position is evaluated against India's coastline. The system calculates proximity and assigns a prototype risk category:

```text
< 100 km       → Very High
100–250 km     → High
250–500 km     → Moderate
> 500 km       → Low
```

> **Note:** These are prototype decision-support thresholds and are not official IMD warning thresholds.

### 9. Forecast Results

Model predictions and derived risk information are integrated into forecast result data.

The current frontend uses:

```text
reports/final_forecast_results.csv
```

### 10. Interactive Dashboard

The frontend is built using React and Leaflet and provides:

- Cyclone selection
- Forecast initialization selection
- Current cyclone state
- Track View
- India View
- Historical track
- AI forecast track
- Multi-horizon forecast points
- Predictive spread
- Intensity forecast
- Risk assessment
- Forecast timeline
- Model performance
- Uncertainty visualization

## End-to-End Workflow

```text
Satellite Data
      ↓
Preprocessing
      ↓
Temporal Sequence Construction
      ↓
AI / ML Models
      ↓
Track + Intensity + RI
      ↓
Uncertainty Estimation
      ↓
India Risk Assessment
      ↓
Forecast Results
      ↓
React Dashboard
      ↓
Decision Support
```

## Technology Stack

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

### Frontend
- React
- Vite
- JavaScript
- HTML
- CSS
- Leaflet
- React-Leaflet
- Papa Parse

### Development
- VS Code
- WSL / Ubuntu
- NVIDIA GPU
- Git
- GitHub
