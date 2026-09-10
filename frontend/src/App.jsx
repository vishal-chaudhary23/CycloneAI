import { useEffect, useState } from "react";
import Papa from "papaparse";

import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./App.css";


// --------------------------------------------------
// MAP AUTO-ZOOM
// --------------------------------------------------

function MapBounds({ history, forecast }) {
  const map = useMap();

  useEffect(() => {
    const points = [...history, ...forecast];

    if (points.length > 0) {
      map.fitBounds(points, {
        padding: [50, 50],
      });
    }
  }, [history, forecast, map]);

  return null;
}


// --------------------------------------------------
// MAIN APP
// --------------------------------------------------

function App() {

  const [data, setData] = useState([]);
  const [cyclone, setCyclone] = useState("");
  const [rowIndex, setRowIndex] = useState(0);


  // --------------------------------------------------
  // LOAD CSV
  // --------------------------------------------------

  useEffect(() => {

    fetch("/final_forecast_results.csv")
      .then((response) => response.text())
      .then((text) => {

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,

          complete: (result) => {

            const rows = result.data;

            setData(rows);

            if (rows.length > 0) {
              setCyclone(rows[0].ID);
            }
          },
        });

      })
      .catch((error) => {
        console.error("Failed to load CSV:", error);
      });

  }, []);


  // --------------------------------------------------
  // CYCLONE LIST
  // --------------------------------------------------

  const cyclones = [
    ...new Set(
      data
        .map((row) => row.ID)
        .filter(Boolean)
    ),
  ].sort();


  // --------------------------------------------------
  // SELECTED CYCLONE DATA
  // --------------------------------------------------

  const cycloneData = data
    .filter((row) => row.ID === cyclone)
    .sort(
      (a, b) =>
        new Date(a.target_time) -
        new Date(b.target_time)
    );


  const sample = cycloneData[rowIndex];


  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (!sample) {

    return (
      <div className="loading">
        Loading Cyclone Intelligence AI...
      </div>
    );

  }


  // --------------------------------------------------
  // PARSE HISTORICAL TRACK
  // --------------------------------------------------

  const historyLat = JSON.parse(
    sample.lat_history
      .replace(/'/g, '"')
  );

  const historyLon = JSON.parse(
    sample.lon_history
      .replace(/'/g, '"')
  );


  const history = historyLat.map(
    (lat, index) => [
      Number(lat),
      Number(historyLon[index]),
    ]
  );


  // --------------------------------------------------
  // AI FORECAST
  // --------------------------------------------------

  const forecast = [

    [
      Number(sample.lat_6h),
      Number(sample.lon_6h),
    ],

    [
      Number(sample.lat_12h),
      Number(sample.lon_12h),
    ],

    [
      Number(sample.lat_18h),
      Number(sample.lon_18h),
    ],

    [
      Number(sample.lat_24h),
      Number(sample.lon_24h),
    ],

  ];


  // --------------------------------------------------
  // UNCERTAINTY
  // --------------------------------------------------

  const uncertainty = [
    10.65,
    19.90,
    29.18,
    40.95,
  ];


  // --------------------------------------------------
  // CURRENT POSITION
  // --------------------------------------------------

  const current =
    history[history.length - 1];


  // --------------------------------------------------
  // FORECAST TIME
  // --------------------------------------------------

  const forecastTime =
    new Date(sample.target_time);


  // --------------------------------------------------
  // RISK
  // --------------------------------------------------

  const risk = sample.risk_6h;


  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (

    <div className="app">


      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="header">

        <div className="logo">
          🌀
        </div>

        <div>

          <h1>
            Cyclone Intelligence AI
          </h1>

          <p>
            AI-based tropical cyclone track,
            intensity and risk forecasting
          </p>

        </div>

      </header>


      <div className="layout">


        {/* ========================================
            SIDEBAR
        ======================================== */}

        <aside className="sidebar">

          <h2>
            Forecast Selection
          </h2>


          {/* Cyclone */}

          <label>
            Cyclone
          </label>

          <select
            value={cyclone}
            onChange={(event) => {

              setCyclone(event.target.value);

              setRowIndex(0);

            }}
          >

            {cyclones.map((id) => (

              <option
                key={id}
                value={id}
              >
                {id}
              </option>

            ))}

          </select>


          {/* Forecast initialization */}

          <label className="forecast-label">

            Forecast Initialization

          </label>


          <input
            type="range"
            min="0"
            max={
              Math.max(
                cycloneData.length - 1,
                0
              )
            }
            value={rowIndex}
            onChange={(event) =>
              setRowIndex(
                Number(event.target.value)
              )
            }
          />


          <div className="slider-info">

            <span>
              {rowIndex}
            </span>

            <span>
              {Math.max(
                cycloneData.length - 1,
                0
              )}
            </span>

          </div>


          <p className="time">

            {forecastTime.toLocaleString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "UTC",
              }
            )} UTC

          </p>


          <div className="sidebar-info">

            <div>
              <span>
                Forecast Horizon
              </span>

              <strong>
                24 Hours
              </strong>
            </div>


            <div>
              <span>
                Prediction Steps
              </span>

              <strong>
                6h / 12h / 18h / 24h
              </strong>
            </div>


            <div>
              <span>
                Input History
              </span>

              <strong>
                5 Satellite Frames
              </strong>
            </div>

          </div>

        </aside>


        {/* ========================================
            MAIN CONTENT
        ======================================== */}

        <main className="main">


          {/* ======================================
              CURRENT STATE
          ====================================== */}

          <h2 className="section-title">

            Current Cyclone State

          </h2>


          <p className="initialization-time">

            Forecast initialized:
            {" "}
            {forecastTime.toLocaleString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "UTC",
              }
            )}
            {" "}UTC

          </p>


          <div className="metrics">


            {/* Latitude */}

            <div className="metric-card">

              <span>
                Latitude
              </span>

              <strong>
                {current[0].toFixed(2)}°
              </strong>

            </div>


            {/* Longitude */}

            <div className="metric-card">

              <span>
                Longitude
              </span>

              <strong>
                {current[1].toFixed(2)}°
              </strong>

            </div>


            {/* Intensity */}

            <div className="metric-card">

              <span>
                Predicted +6h Intensity
              </span>

              <strong>
                {Number(
                  sample.vmax_6h
                ).toFixed(1)} kt
              </strong>

            </div>


            {/* Risk */}

            <div className="metric-card">

              <span>
                Current Risk
              </span>

              <strong className="risk">

                {risk}

              </strong>

            </div>

          </div>


          {/* ======================================
              MAP
          ====================================== */}

          <h2 className="section-title">

            AI Track Forecast

          </h2>


          <div className="map-container">

            <MapContainer

              center={[
                15,
                78,
              ]}

              zoom={5}

              scrollWheelZoom={true}

            >

              {/* Automatically fit cyclone track */}

              <MapBounds
                history={history}
                forecast={forecast}
              />


              {/* OpenStreetMap */}

              <TileLayer

                attribution="&copy; OpenStreetMap contributors"

                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

              />


              {/* ==================================
                  HISTORICAL TRACK
              ================================== */}

              <Polyline

                positions={history}

                pathOptions={{
                  weight: 4,
                }}

              />


              {/* ==================================
                  AI FORECAST TRACK
              ================================== */}

              <Polyline

                positions={[
                  current,
                  ...forecast,
                ]}

                pathOptions={{
                  weight: 4,
                  dashArray: "8 8",
                }}

              />


              {/* ==================================
                  CURRENT POSITION
              ================================== */}

              <CircleMarker

                center={current}

                radius={10}

                pathOptions={{
                  weight: 3,
                }}

              >

                <Popup>

                  <b>
                    Current Cyclone Position
                  </b>

                  <br />

                  Latitude:
                  {" "}
                  {current[0].toFixed(2)}

                  <br />

                  Longitude:
                  {" "}
                  {current[1].toFixed(2)}

                </Popup>

              </CircleMarker>


              {/* ==================================
                  FORECAST POINTS
              ================================== */}

              {forecast.map(
                (position, index) => {

                  const horizon =
                    (index + 1) * 6;

                  return (

                    <div
                      key={index}
                    >

                      {/* Uncertainty */}

                      <Circle

                        center={position}

                        radius={
                          uncertainty[index] *
                          1000
                        }

                        pathOptions={{
                          fillOpacity: 0.12,
                          weight: 1,
                        }}

                      />


                      {/* Forecast point */}

                      <CircleMarker

                        center={position}

                        radius={7}

                      >

                        <Popup>

                          <b>
                            +{horizon}h AI Forecast
                          </b>

                          <br />

                          Latitude:
                          {" "}
                          {position[0].toFixed(2)}

                          <br />

                          Longitude:
                          {" "}
                          {position[1].toFixed(2)}

                          <br />

                          Predictive spread:
                          {" "}
                          {uncertainty[index]}
                          {" "}km

                        </Popup>

                      </CircleMarker>

                    </div>

                  );

                }

              )}

            </MapContainer>

          </div>


          {/* ======================================
              FORECAST TIMELINE
          ====================================== */}

          <h2 className="section-title">

            Forecast Timeline

          </h2>


          <div className="forecast-cards">

            {[

              {
                horizon: "+6h",
                lat: sample.lat_6h,
                lon: sample.lon_6h,
                distance:
                  sample.coast_distance_6h_km,
                risk:
                  sample.risk_6h,
              },

              {
                horizon: "+12h",
                lat: sample.lat_12h,
                lon: sample.lon_12h,
                distance:
                  sample.coast_distance_12h_km,
                risk:
                  sample.risk_12h,
              },

              {
                horizon: "+18h",
                lat: sample.lat_18h,
                lon: sample.lon_18h,
                distance:
                  sample.coast_distance_18h_km,
                risk:
                  sample.risk_18h,
              },

              {
                horizon: "+24h",
                lat: sample.lat_24h,
                lon: sample.lon_24h,
                distance:
                  sample.coast_distance_24h_km,
                risk:
                  sample.risk_24h,
              },

            ].map((item) => (

              <div
                className="forecast-card"
                key={item.horizon}
              >

                <h3>
                  {item.horizon}
                </h3>

                <p>
                  <span>
                    Position
                  </span>

                  {Number(item.lat).toFixed(2)}°,
                  {" "}
                  {Number(item.lon).toFixed(2)}°
                </p>

                <p>
                  <span>
                    Coast Distance
                  </span>

                  {Number(
                    item.distance
                  ).toFixed(1)} km
                </p>

                <p>
                  <span>
                    Risk
                  </span>

                  <strong>
                    {item.risk}
                  </strong>
                </p>

              </div>

            ))}

          </div>


          {/* ======================================
              MODEL PERFORMANCE
          ====================================== */}

          <h2 className="section-title">

            Model Performance

          </h2>


          <div className="metrics performance">


            <div className="metric-card">

              <span>
                +6h Track Error
              </span>

              <strong>
                26.04 km
              </strong>

            </div>


            <div className="metric-card">

              <span>
                +12h Track Error
              </span>

              <strong>
                57.26 km
              </strong>

            </div>


            <div className="metric-card">

              <span>
                +18h Track Error
              </span>

              <strong>
                91.22 km
              </strong>

            </div>


            <div className="metric-card">

              <span>
                +24h Track Error
              </span>

              <strong>
                128.58 km
              </strong>

            </div>

          </div>


          {/* ======================================
              UNCERTAINTY
          ====================================== */}

          <h2 className="section-title">

            Predictive Uncertainty

          </h2>


          <div className="uncertainty">

            {uncertainty.map(
              (value, index) => (

                <div
                  className="uncertainty-row"
                  key={index}
                >

                  <span>
                    +{(index + 1) * 6}h
                  </span>

                  <div className="bar">

                    <div
                      className="bar-fill"
                      style={{
                        width:
                          `${Math.min(
                            value / 40.95 * 100,
                            100
                          )}%`,
                      }}
                    />

                  </div>

                  <strong>
                    {value.toFixed(2)} km
                  </strong>

                </div>

              )
            )}

          </div>


          {/* ======================================
              FOOTER
          ====================================== */}

          <footer>

            SIH 2026 Prototype
            {" | "}
            Cyclone Intelligence AI

          </footer>

        </main>

      </div>

    </div>

  );

}

export default App;