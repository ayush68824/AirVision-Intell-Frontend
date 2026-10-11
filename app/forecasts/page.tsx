"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { CP, ForecastResponse, getForecast } from "@/lib/api";

export default function ForecastsPage() {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getForecast(CP, [1, 6, 12, 24])
      .then(setForecast)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Forecast failed"));
  }, []);

  const meta = forecast?.data_freshness || {};

  return (
    <AppShell>
      <h1 className="brand" style={{ marginTop: 0, fontSize: "2rem" }}>
        Forecast Intelligence
      </h1>
      <p className="muted">Make ML visible: horizons, intervals, features, and validation notes.</p>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <div className="stat-grid" style={{ margin: "1rem 0" }}>
        <div className="panel" style={{ padding: "1rem" }}>
          <div className="muted">Model</div>
          <strong>{forecast?.model_name || "—"}</strong>
          <div className="muted">v{forecast?.model_version}</div>
        </div>
        <div className="panel" style={{ padding: "1rem" }}>
          <div className="muted">Stations used</div>
          <strong>{meta.stations ?? "—"}</strong>
          <div className="muted">Sources: {(meta.sources || []).join(", ") || "—"}</div>
        </div>
        <div className="panel" style={{ padding: "1rem" }}>
          <div className="muted">Interpolation</div>
          <strong>{meta.interpolation?.method || "—"}</strong>
          <div className="muted">Base PM2.5 {meta.interpolation?.pm25 ?? "—"}</div>
        </div>
        <div className="panel" style={{ padding: "1rem" }}>
          <div className="muted">Quality</div>
          <strong>{meta.quality_ok ? "OK" : "Check flags"}</strong>
          <div className="muted">Latest {meta.latest_observed_at || "—"}</div>
        </div>
      </div>

      <div className="panel" style={{ padding: "1rem" }}>
        <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Multi-horizon PM2.5</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
              <th style={{ padding: 8 }}>Horizon</th>
              <th>Mean</th>
              <th>P10–P90</th>
              <th>AQI</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {(forecast?.horizons || []).map((h) => (
              <tr key={h.horizon_hours} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: 8 }}>{h.horizon_hours}h</td>
                <td>{h.pm25_mean}</td>
                <td>
                  {h.pm25_p10}–{h.pm25_p90}
                </td>
                <td>{h.aqi_estimate}</td>
                <td>{h.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted" style={{ fontSize: "0.85rem", marginBottom: 0 }}>
          Historical vs predicted charts require retained observation archives. Bootstrap validation metrics ship in
          Operations (MAE/RMSE from held-out synthetic panel until real station backtests are wired).
        </p>
      </div>
    </AppShell>
  );
}
