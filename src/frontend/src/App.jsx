import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Circle,
  Popup,
  Tooltip,
  useMap
} from "react-leaflet";

import {
  Wind,
  MapPin,
  Clock3,
  Satellite,
  ShieldAlert,
  Activity,
  Navigation,
  ChevronRight
} from "lucide-react";

import "leaflet/dist/leaflet.css";
import "./index.css";


const HORIZONS = [6, 12, 18, 24];

const UNCERTAINTY = {
  6: 10.65,
  12: 19.90,
  18: 29.18,
  24: 40.95
};


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function parseArray(value) {
  if (!value) return [];

  return value
    .replace("[", "")
    .replace("]", "")
    .split(",")
    .map(v => Number(v.trim()))
    .filter(v => !Number.isNaN(v));
}


function riskClass(risk) {
  if (!risk) return "low";

  const r = risk.toLowerCase();

  if (r.includes("very")) return "very-high";
  if (r.includes("high")) return "high";
  if (r.includes("moderate")) return "moderate";

  return "low";
}


function formatTime(value) {
  if (!value) return "";

  const d = new Date(value);

  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }) + " UTC";
}


// --------------------------------------------------
// MAP CONTROLLER
// --------------------------------------------------


// --------------------------------------------------
// MAP
// --------------------------------------------------

function CycloneMap({ sample, mapView }) {
  const historyLat = parseArray(sample.lat_history);
  const historyLon = parseArray(sample.lon_history);

  const history = historyLat
    .map((lat, i) => [lat, historyLon[i]])
    .filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon));

  const forecast = HORIZONS
    .map(h => [
      Number(sample[`lat_${h}h`]),
      Number(sample[`lon_${h}h`])
    ])
    .filter(([lat, lon]) => Number.isFinite(lat) && Number.isFinite(lon));

  if (!history.length) {
    return (
      <div className="map-wrapper">
        <div className="map-empty">
          No track data available
        </div>
      </div>
    );
  }

  const current = history[history.length - 1];

  const allPoints = [
    ...history,
    ...forecast
  ];

  
function MapController() {
  const map = useMap();

  useEffect(() => {
    if (mapView === "track" && allPoints.length > 1) {
      map.fitBounds(allPoints, {
        padding: [80, 80],
        animate: true,
        duration: 0.8,
        maxZoom: 8
      });
    }
  }, [
    map,
    mapView,
    sample.ID,
    sample.target_time
  ]);

  return null;
}

  /*
   * India View:
   * Show a broad Indian Ocean context.
   *
   * Track View:
   * Automatically zoom around the cyclone track.
   */



  

  return (
    <div className={`map-wrapper ${mapView === "india" ? "india-map" : "track-map"}`}>

      <MapContainer
        key={`${mapView}-${sample.ID}`}
        center={
          mapView === "india"
            ? [20.5937, 78.9629]
            : current
        }
        zoom={
          mapView === "india"
            ? 5
            : 7
        }
        scrollWheelZoom={true}
        zoomControl={true}
        className="cyclone-map"
      >

        <MapController />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* =========================================
            HISTORICAL TRACK
        ========================================= */}

        <Polyline
          positions={history}
          pathOptions={{
            color: "#3b82f6",
            weight: 4,
            opacity: 0.9
          }}
        />

        {/* Historical points */}

        {history.map((point, index) => (
          <CircleMarker
            key={`history-${index}`}
            center={point}
            radius={index === history.length - 1 ? 8 : 4}
            pathOptions={{
              color: "#60a5fa",
              fillColor: "#2563eb",
              fillOpacity: index === history.length - 1 ? 1 : 0.8,
              weight: 2
            }}
          />
        ))}


        {/* =========================================
            CURRENT POSITION
        ========================================= */}

        <CircleMarker
          center={current}
          radius={mapView === "india" ? 4 : 11}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#2563eb",
            fillOpacity: 1,
            weight: 3
          }}
        >
          <Popup>
            <div className="map-popup">

              <strong>
                Current Cyclone Position
              </strong>

              <span>
                {current[0].toFixed(2)}° N
              </span>

              <span>
                {current[1].toFixed(2)}° E
              </span>

            </div>
          </Popup>
        </CircleMarker>


        {/* =========================================
            FORECAST TRACK
        ========================================= */}

        <Polyline
          positions={[
            current,
            ...forecast
          ]}
          pathOptions={{
            color: "#f97316",
            weight: 4,
            opacity: 0.95,
            dashArray: "10 8"
          }}
        />


        {/* =========================================
            FORECAST POINTS + UNCERTAINTY
        ========================================= */}

        {forecast.map(([lat, lon], index) => {

          const horizon = HORIZONS[index];
          const uncertainty = UNCERTAINTY[horizon];

          return (
            <div key={horizon}>

              {/* uncertainty */}
              {mapView === "track" && (
              <Circle
                center={[lat, lon]}
                radius={uncertainty * 1000}
                pathOptions={{
                  color: "#00e5ff",
                  fillColor: "#00e5ff",
                  fillOpacity: 0.10,
                  weight: 1.5,
                  opacity: 0.65
                }}
              />)}

              {/* forecast point */}

              <CircleMarker
                center={[lat, lon]}
                radius={mapView === "india" ? 4 : 8}
                pathOptions={{
                  color: "#ffffff",
                  fillColor: "#f97316",
                  fillOpacity: 1,
                  weight: 2
                }}
              >

                 {/* {mapView === "track" && ( */}
                  <Tooltip
                    permanent
                    direction="top"
                    offset={[0, -8]}
                    className="forecast-label"
                  >
                    +{horizon}h
                  </Tooltip>
                {/* )} */}

                <Popup>

                  <div className="map-popup">

                    <strong>
                      AI Forecast +{horizon}h
                    </strong>

                    <span>
                      Latitude: {lat.toFixed(2)}°
                    </span>

                    <span>
                      Longitude: {lon.toFixed(2)}°
                    </span>

                    <span>
                      Predictive spread: {uncertainty} km
                    </span>

                  </div>

                </Popup>

              </CircleMarker>


              {/* horizon label */}

              <CircleMarker
                center={[lat, lon]}
                radius={0}
                pathOptions={{
                  opacity: 0
                }}
              />

            </div>
          );
        })}

      </MapContainer>


      {/* =========================================
          MAP HEADER
      ========================================= */}

      <div className="map-overlay-header">

        <div>
          <span className="map-view-label">
            {mapView === "india"
              ? "INDIA REGIONAL VIEW"
              : "CYCLONE TRACK VIEW"}
          </span>

          <strong>
            {sample.ID}
          </strong>
        </div>

        <div className="map-live-badge">
          <span />
          AI FORECAST
        </div>

      </div>


      {/* =========================================
          LEGEND
      ========================================= */}

      <div className="map-legend">

        <span>
          <i className="legend-line historical" />
          Historical
        </span>

        <span>
          <i className="legend-line forecast" />
          AI Forecast
        </span>

        <span>
          <i className="legend-circle uncertainty" />
          Predictive Spread
        </span>

        <span>
          <i className="legend-current" />
          Current
        </span>

      </div>


      {/* =========================================
          VIEW DESCRIPTION
      ========================================= */}

      <div className="map-view-description">

        {mapView === "india" ? (
          <>
            <strong>India View</strong>
            <span>
              Regional cyclone position across the Indian Ocean
            </span>
          </>
        ) : (
          <>
            <strong>Track View</strong>
            <span>
              Detailed AI trajectory with predictive spread
            </span>
          </>
        )}

      </div>

    </div>
  );
}


// --------------------------------------------------
// STAT CARD
// --------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  accent
}) {

  return (
    <div className={`stat-card ${accent || ""}`}>

      <div className="stat-icon">
        <Icon size={20} />
      </div>

      <div>

        <div className="stat-label">
          {label}
        </div>

        <div className="stat-value">
          {value}
        </div>

      </div>

    </div>
  );
}


// --------------------------------------------------
// APP
// --------------------------------------------------

export default function App() {

  const [data, setData] = useState([]);

  const [selectedCyclone, setSelectedCyclone] =
    useState("");

  const [rowIndex, setRowIndex] =
    useState(0);

  const [mapView, setMapView] =
    useState("india");


  // ------------------------------------------------
  // LOAD CSV
  // ------------------------------------------------

  useEffect(() => {

    Papa.parse(
      "/final_forecast_results.csv",
      {
        download: true,
        header: true,
        dynamicTyping: true,

        complete: result => {

          const clean = result.data.filter(
            row => row.ID
          );

          setData(clean);

          if (clean.length > 0) {
            setSelectedCyclone(
              String(clean[0].ID)
            );
          }

        }
      }
    );

  }, []);


  // ------------------------------------------------
  // CYCLONES
  // ------------------------------------------------

  const cyclones = useMemo(() => {

    return [
      ...new Set(
        data.map(
          row => String(row.ID)
        )
      )
    ].sort();

  }, [data]);


  // ------------------------------------------------
  // SELECTED CYCLONE
  // ------------------------------------------------

  const cycloneData = useMemo(() => {

    return data.filter(
      row =>
        String(row.ID) ===
        selectedCyclone
    );

  }, [data, selectedCyclone]);


  // Reset slider when cyclone changes

  useEffect(() => {

    setRowIndex(0);

  }, [selectedCyclone]);


  const sample =
    cycloneData[rowIndex];


  if (!sample) {

    return (
      <div className="loading">
        Loading Cyclone Intelligence AI...
      </div>
    );

  }


  const historyLat =
    parseArray(sample.lat_history);

  const historyLon =
    parseArray(sample.lon_history);


  const currentLat =
    historyLat[historyLat.length - 1];

  const currentLon =
    historyLon[historyLon.length - 1];


  // ------------------------------------------------
  // UI
  // ------------------------------------------------

  return (

    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div className="brand">

          <div className="brand-icon">
            🌀
          </div>

          <div>

            <h1>
              Cyclone Intelligence AI
            </h1>

            <p>
              AI-based tropical cyclone
              track, intensity and risk forecasting
            </p>

          </div>

        </div>


        <div className="header-status">

          <span className="status-dot" />

          SIH 2026

        </div>

      </header>


      <main className="layout">


        {/* SIDEBAR */}

        <aside className="sidebar">

          <div className="sidebar-title">
            Forecast Selection
          </div>


          <label>
            Cyclone
          </label>

          <select
            value={selectedCyclone}
            onChange={e =>
              setSelectedCyclone(e.target.value)
            }
          >

            {cyclones.map(id => (

              <option
                key={id}
                value={id}
              >
                {id}
              </option>

            ))}

          </select>


          <div className="control-section">

            <label>
              Forecast Initialization
            </label>

            <input
              type="range"
              min="0"
              max={Math.max(
                cycloneData.length - 1,
                0
              )}
              value={rowIndex}
              onChange={e =>
                setRowIndex(
                  Number(e.target.value)
                )
              }
            />

            <div className="slider-labels">

              <span>
                0
              </span>

              <span>
                {Math.max(
                  cycloneData.length - 1,
                  0
                )}
              </span>

            </div>


            <div className="time-display">

              <Clock3 size={16} />

              {formatTime(
                sample.target_time
              )}

            </div>

          </div>


          {/* INFO CARDS */}

          <div className="sidebar-cards">

            <div className="info-card">

              <span>
                Forecast Horizon
              </span>

              <strong>
                24 Hours
              </strong>

            </div>


            <div className="info-card">

              <span>
                Prediction Steps
              </span>

              <strong>
                6h / 12h / 18h / 24h
              </strong>

            </div>


            <div className="info-card">

              <span>
                Input History
              </span>

              <strong>
                5 Satellite Frames
              </strong>

            </div>

          </div>

        </aside>


        {/* MAIN */}

        <section className="content">


          {/* TITLE */}

          <div className="page-heading">

            <div>

              <div className="eyebrow">
                TROPICAL CYCLONE FORECAST
              </div>

              <h2>
                Current Cyclone State
              </h2>

              <p>
                Forecast initialized:
                {" "}
                {formatTime(
                  sample.target_time
                )}
              </p>

            </div>

            <div className="model-badge">
              <Activity size={16} />
              AI MODEL
            </div>

          </div>


          {/* STATS */}

          <div className="stats-grid">

            <StatCard
              icon={MapPin}
              label="Latitude"
              value={`${currentLat.toFixed(2)}°`}
            />

            <StatCard
              icon={Navigation}
              label="Longitude"
              value={`${currentLon.toFixed(2)}°`}
            />

            <StatCard
              icon={Wind}
              label="Predicted +6h Intensity"
              value={`${Number(
                sample.vmax_6h
              ).toFixed(1)} kt`}
              accent="orange"
            />

            <StatCard
              icon={ShieldAlert}
              label="Current Risk"
              value={sample.risk_6h || "Low"}
              accent={
                riskClass(sample.risk_6h)
              }
            />

          </div>


          {/* MAP */}

          <div className="section-heading">

            <div>

              <h2>
                AI Track Forecast
              </h2>

              <p>
                24-hour predicted cyclone trajectory
                with model-derived uncertainty
              </p>

            </div>


            <div className="view-switch">

              <button
                className={
                  mapView === "track"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setMapView("track")
                }
              >
                Track View
              </button>

              <button
                className={
                  mapView === "india"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setMapView("india")
                }
              >
                India View
              </button>

            </div>

          </div>


          <CycloneMap
            sample={sample}
            mapView={mapView}
          />


          {/* FORECAST TIMELINE */}

          <div className="section-heading timeline-heading">

            <div>

              <h2>
                Forecast Timeline
              </h2>

              <p>
                Predicted position and risk by horizon
              </p>

            </div>

          </div>


          <div className="forecast-grid">

            {HORIZONS.map(horizon => {

              const risk =
                sample[`risk_${horizon}h`] ||
                "Low";

              return (

                <div
                  className="forecast-card"
                  key={horizon}
                >

                  <div className="forecast-top">

                    <span>
                      +{horizon}h
                    </span>

                    <span
                      className={`risk-pill ${riskClass(risk)}`}
                    >
                      {risk}
                    </span>

                  </div>


                  <div className="forecast-position">

                    <div>

                      <small>
                        LATITUDE
                      </small>

                      <strong>
                        {Number(
                          sample[`lat_${horizon}h`]
                        ).toFixed(2)}°
                      </strong>

                    </div>


                    <div>

                      <small>
                        LONGITUDE
                      </small>

                      <strong>
                        {Number(
                          sample[`lon_${horizon}h`]
                        ).toFixed(2)}°
                      </strong>

                    </div>

                  </div>


                  <div className="forecast-distance">

                    <Satellite size={15} />

                    {Number(
                      sample[
                        `coast_distance_${horizon}h_km`
                      ]
                    ).toFixed(0)}

                    km from India

                  </div>

                </div>

              );

            })}

          </div>


          {/* MODEL PERFORMANCE */}

          <div className="section-heading performance-heading">

            <div>

              <h2>
                Model Performance
              </h2>

              <p>
                Mean track error on held-out cyclone cases
              </p>

            </div>

          </div>


          <div className="performance-grid">

            <div className="performance-card">
              <span>+6h</span>
              <strong>26.04 km</strong>
              <small>Mean Error</small>
            </div>

            <div className="performance-card">
              <span>+12h</span>
              <strong>57.26 km</strong>
              <small>Mean Error</small>
            </div>

            <div className="performance-card">
              <span>+18h</span>
              <strong>91.22 km</strong>
              <small>Mean Error</small>
            </div>

            <div className="performance-card">
              <span>+24h</span>
              <strong>128.58 km</strong>
              <small>Mean Error</small>
            </div>

          </div>


          {/* FOOTER */}

          <footer>

            <div>
              Cyclone Intelligence AI
            </div>

            <span>
              SIH 2026 Prototype
            </span>

          </footer>

        </section>

      </main>

    </div>
  );
}