"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { CP, INDIA_GATE, simulateDeparture, SimulationResponse } from "@/lib/api";

export default function SimulationPage() {
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pmShock, setPmShock] = useState(0);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const base = new Date();
      base.setDate(base.getDate() + 1);
      base.setHours(8, 0, 0, 0);
      const data = await simulateDeparture({
        origin: CP,
        destination: INDIA_GATE,
        base_departure: base.toISOString(),
        offsets_minutes: [-60, -30, 0, 30, 60],
        mode: "walk",
      });
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Simulation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <h1 className="brand" style={{ marginTop: 0, fontSize: "2rem" }}>
        Environmental Digital Twin
      </h1>
      <p className="muted">
        What-if departure times and scenario knobs. Assumptions and uncertainty are shown explicitly.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", margin: "1rem 0" }}>
        <button className="btn btn-primary" onClick={run} disabled={loading}>
          {loading ? "Simulating…" : "Simulate tomorrow 8 AM walk"}
        </button>
        <label className="panel" style={{ padding: "0.6rem 0.9rem" }}>
          Hypothetical PM shock (display only): {pmShock}%
          <input
            type="range"
            min={-20}
            max={40}
            value={pmShock}
            onChange={(e) => setPmShock(Number(e.target.value))}
            style={{ width: 180, display: "block" }}
          />
        </label>
      </div>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      {result && (
        <div className="panel" style={{ padding: "1rem" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Scenario comparison</h2>
          <p>{result.recommendation}</p>
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            {result.assumptions} UI shock knob ({pmShock}%) is illustrative only until coupled to a validated transport
            model.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--line)" }}>
                <th style={{ padding: 8 }}>Offset</th>
                <th>Route</th>
                <th>Dose (ug)</th>
                <th>PM2.5</th>
                <th>Fast / Clean / Balanced doses</th>
              </tr>
            </thead>
            <tbody>
              {(result.scenarios || []).map((s) => (
                <tr key={s.offset_minutes} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: 8 }}>{s.offset_minutes} min</td>
                  <td>{s.recommendation_id}</td>
                  <td>{(s.inhaled_dose_ug * (1 + pmShock / 100)).toFixed(3)}</td>
                  <td>{s.mean_pm25}</td>
                  <td className="muted">
                    {s.by_route?.fastest?.inhaled_dose_ug} / {s.by_route?.cleanest?.inhaled_dose_ug} /{" "}
                    {s.by_route?.balanced?.inhaled_dose_ug}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
