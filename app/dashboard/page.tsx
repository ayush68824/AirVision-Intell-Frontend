"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { AqiReading, CP, ForecastResponse, getForecast, INDIA_GATE, latestAqi } from "@/lib/api";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });

export default function DashboardPage() {
  const [aqi, setAqi] = useState<AqiReading[]>([]);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [stations, fc] = await Promise.all([latestAqi("Delhi"), getForecast(CP)]);
        setAqi(stations);
        setForecast(fc);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load command center");
      }
    })();
  }, []);

  const primary = aqi[0];
  const freshness = primary?.observed_at || "Unknown";
  const source = primary?.source || "awaiting";
  const demo = !source || String(source).startsWith("mock");

  return (
    <AppShell demoMode={demo}>
      <h1 className="brand" style={{ marginTop: 0, fontSize: "2rem" }}>
        Environmental Command Center
      </h1>
      <p className="muted">Live operational overview for Delhi — measured stations + predicted horizons.</p>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <div className="stat-grid" style={{ margin: "1.25rem 0" }}>
        <div className="panel" style={{ padding: "1rem" }}>
          <div className="muted">PM2.5 (nearest/mock)</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{primary?.pm25 ?? "—"} <span style={{ fontSize: "0.9rem" }}>ug/m3</span></div>
          <div className="muted">Measured · {source}</div>
        </div>
        <div className="panel" style={{ padding: "1rem" }}>
          <div className="muted">AQI</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{primary?.aqi ?? "—"}</div>
          <div className="muted">Station coverage: {aqi.length}</div>
        </div>
        <div className="panel" style={{ padding: "1rem" }}>
          <div className="muted">Data freshness</div>
          <div style={{ fontSize: "1.05rem", fontWeight: 700, wordBreak: "break-all" }}>{freshness}</div>
          <div className="muted">Timestamp required for trust</div>
        </div>
        <div className="panel" style={{ padding: "1rem" }}>
          <div className="muted">Model</div>
          <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>{forecast?.model_name || "—"}</div>
          <div className="muted">v{forecast?.model_version || "?"} · predicted</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem" }} className="workspace-grid">
        <div className="panel" style={{ height: 380, padding: "0.55rem" }}>
          <RouteMap
            origin={CP}
            destination={INDIA_GATE}
            options={[]}
            stations={aqi.map((s) => ({
              lat: s.location.lat,
              lng: s.location.lng,
              name: s.station_name,
              pm25: s.pm25 ?? undefined,
            }))}
          />
        </div>
        <div className="panel" style={{ padding: "1rem" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Forecast trends</h2>
          <p className="muted" style={{ fontSize: "0.88rem" }}>
            Prediction intervals — not facts. Hotspots below use station ranking (higher PM2.5 first).
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {(forecast?.horizons || []).map((h) => (
              <div key={h.horizon_hours} style={{ background: "rgba(15,61,76,0.05)", borderRadius: 10, padding: "0.65rem" }}>
                <strong>{h.horizon_hours}h</strong> · {h.pm25_mean} ug/m3 · AQI~{h.aqi_estimate} · {h.category}
                <div className="muted" style={{ fontSize: "0.8rem" }}>
                  80% interval {h.pm25_p10}-{h.pm25_p90}
                </div>
              </div>
            ))}
          </div>
          <h3 style={{ fontFamily: "var(--font-display)" }}>Pollution hotspots</h3>
          <ol style={{ margin: 0, paddingLeft: "1.1rem" }}>
            {[...aqi]
              .sort((a, b) => (b.pm25 || 0) - (a.pm25 || 0))
              .slice(0, 4)
              .map((s) => (
                <li key={s.station_id}>
                  {s.station_name}: {s.pm25} ug/m3 (AQI {s.aqi})
                </li>
              ))}
          </ol>
        </div>
      </div>
    </AppShell>
  );
}
