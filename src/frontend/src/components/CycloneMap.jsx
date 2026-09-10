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

  /*
   * India View:
   * Show a broad Indian Ocean context.
   *
   * Track View:
   * Automatically zoom around the cyclone track.
   */
  const indiaBounds = [
    [2, 55],
    [28, 100]
  ];

  const trackBounds = allPoints;

  function MapController() {
    const map = useMap();

    useEffect(() => {
      if (mapView === "india") {
        map.fitBounds(indiaBounds, {
          padding: [30, 30],
          animate: true,
          duration: 0.8
        });
      } else if (trackBounds.length > 1) {
        map.fitBounds(trackBounds, {
          padding: [70, 70],
          animate: true,
          duration: 0.8,
          maxZoom: 8
        });
      }
    }, [map, mapView, sample.ID]);

    return null;
  }

  return (
    <div className={`map-wrapper ${mapView === "india" ? "india-map" : "track-map"}`}>

      <MapContainer
        center={current}
        zoom={mapView === "india" ? 5 : 7}
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
          radius={11}
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

              <Circle
                center={[lat, lon]}
                radius={uncertainty * 1000}
                pathOptions={{
                  color: "#a78bfa",
                  fillColor: "#a78bfa",
                  fillOpacity: 0.10,
                  weight: 1.5,
                  opacity: 0.65
                }}
              />

              {/* forecast point */}

              <CircleMarker
                center={[lat, lon]}
                radius={8}
                pathOptions={{
                  color: "#ffffff",
                  fillColor: "#f97316",
                  fillOpacity: 1,
                  weight: 2
                }}
              >

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