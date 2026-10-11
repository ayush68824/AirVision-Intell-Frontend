"use client";

import dynamic from "next/dynamic";
import { FormEvent, useState } from "react";
import AppShell from "@/components/AppShell";
import { CP, INDIA_GATE, optimizeRoutes } from "@/lib/api";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });

export default function RoutesPage() {
  const [mode, setMode] = useState("walk");
  const [departureLocal, setDepartureLocal] = useState("");
  const [selectedId, setSelectedId] = useState<string>();
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const departure_at = departureLocal ? new Date(departureLocal).toISOString() : undefined;
      const data = await optimizeRoutes({
        origin: CP,
        destination: INDIA_GATE,
        mode,
        departure_at,
        health_profile: { conditions: ["asthma"], sensitivity: "high" },
      });
      setResult(data);
      setSelectedId(data.recommendation_id);
    } catch (err: any) {
      setError(err.message || "Routing failed");
    } finally {
      setLoading(false);
    }
  }

  const options = result?.options || [];
  const comps = result?.leave_earlier_suggestion?.comparisons || [];

  return (
    <AppShell demoMode={(result?.data_mode || "synthetic_demo").includes("synthetic")}>
      <h1 className="brand" style={{ marginTop: 0, fontSize: "2rem" }}>
        Smart Route Laboratory
      </h1>
      <p className="muted">Core product workspace — selectable overlays, modes, departure time, distinct alternatives.</p>

      <form
        onSubmit={onSubmit}
        className="panel"
        style={{ padding: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "0.75rem", margin: "1rem 0" }}
      >
        <label className="muted">
          Origin
          <div style={{ fontWeight: 700, color: "var(--ink)" }}>Connaught Place</div>
        </label>
        <label className="muted">
          Destination
          <div style={{ fontWeight: 700, color: "var(--ink)" }}>India Gate</div>
        </label>
        <label>
          Mode
          <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 10 }}>
            <option value="walk">Walking</option>
            <option value="bike">Cycling</option>
            <option value="drive">Driving</option>
          </select>
        </label>
        <label>
          Departure (local)
          <input
            type="datetime-local"
            value={departureLocal}
            onChange={(e) => setDepartureLocal(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 10 }}
          />
        </label>
        <div style={{ display: "flex", alignItems: "end" }}>
          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? "Optimizing…" : "Optimize routes"}
          </button>
        </div>
      </form>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem" }} className="workspace-grid">
        <div className="panel" style={{ height: 420, padding: "0.55rem" }}>
          <RouteMap origin={CP} destination={INDIA_GATE} options={options} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="panel" style={{ padding: "1rem" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Alternatives</h2>
          {result && (
            <p className="muted" style={{ fontSize: "0.88rem" }}>
              {result.identity_note} · {result.medical_disclaimer}
            </p>
          )}
          <div style={{ display: "grid", gap: 8 }}>
            {options.map((o: any) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelectedId(o.id)}
                style={{
                  textAlign: "left",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  padding: "0.75rem",
                  background: o.id === selectedId ? "rgba(47,111,78,0.12)" : "white",
                }}
              >
                <strong>{o.label}</strong>
                <div className="muted" style={{ fontSize: "0.88rem" }}>
                  {o.metrics.distance_m} m · {o.metrics.duration_min} min · PM2.5 {o.metrics.mean_pm25} (
                  {o.metrics.pm25_p10}-{o.metrics.pm25_p90}) · dose {o.metrics.inhaled_dose_ug} ug
                </div>
              </button>
            ))}
          </div>
          {!!comps.length && (
            <>
              <h3 style={{ fontFamily: "var(--font-display)" }}>Departure-time simulation</h3>
              <p className="muted" style={{ fontSize: "0.85rem" }}>
                Recomputed on recommended corridor ({result?.recommendation_id}).
              </p>
              <input
                type="range"
                min={0}
                max={Math.max(comps.length - 1, 0)}
                defaultValue={comps.findIndex((c: any) => c.offset_minutes === 0)}
                onChange={() => {}}
                style={{ width: "100%" }}
                list="offsets"
              />
              <ul style={{ paddingLeft: "1.1rem" }}>
                {comps.map((c: any) => (
                  <li key={c.offset_minutes}>
                    offset {c.offset_minutes} min → dose {c.inhaled_dose_ug} ug · PM2.5 {c.mean_pm25}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
