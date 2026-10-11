"use client";

import dynamic from "next/dynamic";
import { CSSProperties, FormEvent, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { agentQuery, AgentResponse, CP, getApiUrl, INDIA_GATE } from "@/lib/api";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });

const SAMPLE_QUERY =
  "I have asthma. I need to travel from Connaught Place to India Gate tomorrow at 8 AM. Predict the pollution, find the safest walking route, compare my inhaled exposure, and tell me whether I should leave earlier.";

export default function ConsolePage() {
  const [message, setMessage] = useState(SAMPLE_QUERY);
  const [mode, setMode] = useState("walk");
  const [sensitivity, setSensitivity] = useState("high");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const options = result?.routes?.options || [];
  const activeId = selectedId || result?.routes?.recommendation_id;
  const horizons = useMemo(() => result?.forecast?.horizons || [], [result]);
  const primaryHorizon = result?.forecast_horizon_hours;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await agentQuery({
        message,
        origin: CP,
        destination: INDIA_GATE,
        mode,
        health_profile: { conditions: sensitivity === "high" ? ["asthma"] : [], sensitivity },
        include_simulation: true,
      });
      setResult(data);
      setSelectedId(data.routes?.recommendation_id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell demoMode={result?.demo_mode ?? true}>
      <div style={{ marginBottom: "1rem" }}>
        <h1 className="brand" style={{ margin: 0, fontSize: "1.9rem" }}>
          Decision workspace
        </h1>
        <p style={{ margin: "0.35rem 0 0", color: "#46606c" }}>
          Three-panel workflow · API {getApiUrl()} · Results labeled measured / predicted / simulated
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(260px, 0.9fr) minmax(320px, 1.2fr) minmax(280px, 1fr)",
          gap: "1rem",
        }}
        className="workspace-grid"
      >
        {/* Panel 1 */}
        <section className="panel" style={{ padding: "1rem", display: "grid", gap: "0.75rem", alignContent: "start" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.2rem" }}>1. Define your journey</h2>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.65rem" }}>
            <label style={labelStyle}>
              Request
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7} style={fieldStyle} />
            </label>
            <label style={labelStyle}>
              Mode
              <select value={mode} onChange={(e) => setMode(e.target.value)} style={fieldStyle}>
                <option value="walk">Walking</option>
                <option value="bike">Cycling</option>
                <option value="drive">Driving</option>
              </select>
            </label>
            <label style={labelStyle}>
              Health sensitivity
              <select value={sensitivity} onChange={(e) => setSensitivity(e.target.value)} style={fieldStyle}>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High (e.g. asthma indicated)</option>
              </select>
            </label>
            <button className="btn btn-primary" disabled={loading} type="submit">
              {loading ? "Running agents…" : "Compare alternatives"}
            </button>
          </form>
          {error && <div style={{ color: "var(--danger)", fontSize: "0.88rem", whiteSpace: "pre-wrap" }}>{error}</div>}
          {result && (
            <div style={{ fontSize: "0.85rem", color: "#35505c", display: "grid", gap: "0.25rem" }}>
              <div>
                <strong>Requested departure:</strong> {result.requested_departure_at || "—"}
              </div>
              <div>
                <strong>Forecast horizon:</strong> ~{primaryHorizon}h
              </div>
              <div>
                <strong>Data mode:</strong> {result.data_mode}
              </div>
            </div>
          )}
        </section>

        {/* Panel 2 */}
        <section style={{ display: "grid", gap: "1rem" }}>
          <div className="panel" style={{ height: 340, padding: "0.55rem" }}>
            <RouteMap
              origin={CP}
              destination={INDIA_GATE}
              options={options}
              selectedId={activeId}
              onSelect={setSelectedId}
            />
          </div>
          <div className="panel" style={{ padding: "1rem" }}>
            <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)", fontSize: "1.2rem" }}>
              2. Compare verified alternatives
            </h2>
            {!options.length && <p style={{ color: "#46606c" }}>Run a comparison to load route overlays.</p>}
            {result?.routes && !result.routes.alternatives_distinct && (
              <p style={{ color: "#b42318", fontSize: "0.9rem" }}>{result.routes.identity_note}</p>
            )}
            <div style={{ display: "grid", gap: "0.55rem" }}>
              {options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelectedId(o.id)}
                  style={{
                    textAlign: "left",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    padding: "0.75rem",
                    cursor: "pointer",
                    background: o.id === activeId ? "rgba(47,111,78,0.12)" : "rgba(15,61,76,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                    <strong>
                      {o.label}
                      {o.id === result?.routes?.recommendation_id ? " · recommended" : ""}
                    </strong>
                    <span style={{ fontSize: "0.85rem" }}>{o.metrics.duration_min} min</span>
                  </div>
                  <div style={{ fontSize: "0.88rem", color: "#35505c", marginTop: 4 }}>
                    {o.metrics.distance_m.toFixed(0)} m · mean PM2.5 {o.metrics.mean_pm25} ug/m3 (
                    {o.metrics.pm25_p10}-{o.metrics.pm25_p90}) · dose {o.metrics.inhaled_dose_ug} ug
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#46606c", marginTop: 4 }}>{o.rationale}</div>
                </button>
              ))}
            </div>
            {result?.routes?.exposure_assumptions && (
              <p style={{ fontSize: "0.8rem", color: "#46606c", marginBottom: 0, marginTop: "0.75rem" }}>
                Dose = {result.routes.exposure_assumptions.formula}. Ventilation{" "}
                {result.routes.exposure_assumptions.ventilation_m3_per_min} m3/min.{" "}
                {result.routes.medical_disclaimer}
              </p>
            )}
          </div>
        </section>

        {/* Panel 3 */}
        <section className="panel" style={{ padding: "1rem", display: "grid", gap: "0.85rem", alignContent: "start" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.2rem" }}>
            3. Explain the recommendation
          </h2>
          {!result && <p style={{ color: "#46606c" }}>Evidence, assumptions and agent trace appear after a run.</p>}
          {result && (
            <>
              {result.demo_mode && (
                <div
                  style={{
                    background: "rgba(217,119,6,0.12)",
                    border: "1px solid rgba(217,119,6,0.35)",
                    borderRadius: 12,
                    padding: "0.7rem",
                    fontSize: "0.88rem",
                  }}
                >
                  Demo estimate — some inputs may be synthetic or degraded. This is not a medical or safety
                  certification.
                </div>
              )}
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5, fontSize: "0.92rem" }}>{result.answer}</div>

              <div>
                <strong>Forecast (predicted)</strong>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginTop: 6 }}>
                  {horizons.map((h) => (
                    <div
                      key={h.horizon_hours}
                      style={{
                        background:
                          h.horizon_hours === primaryHorizon || h.horizon_hours === 24
                            ? "rgba(31,111,139,0.12)"
                            : "rgba(15,61,76,0.05)",
                        borderRadius: 10,
                        padding: "0.55rem",
                        fontSize: "0.82rem",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{h.horizon_hours}h</div>
                      <div>{h.pm25_mean} ug/m3</div>
                      <div style={{ color: "#46606c" }}>
                        {h.pm25_p10}-{h.pm25_p90}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <strong>Agent execution trace</strong>
                <ol style={{ margin: "0.4rem 0 0", paddingLeft: "1.1rem", fontSize: "0.85rem", color: "#35505c" }}>
                  {(result.agent_trace || []).map((step, i) => (
                    <li key={`${step.agent}-${i}`} style={{ marginBottom: 6 }}>
                      <span style={{ fontWeight: 700 }}>{step.agent}</span> [{step.status} / {step.data_class}] —{" "}
                      {step.detail} ({step.latency_ms} ms)
                    </li>
                  ))}
                </ol>
              </div>

              {!!result.citations?.length && (
                <div>
                  <strong>Citations (retrieved)</strong>
                  <ul style={{ margin: "0.35rem 0 0", paddingLeft: "1.1rem", fontSize: "0.85rem" }}>
                    {result.citations.map((c) => (
                      <li key={c.title}>
                        {c.title} — {c.source}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ fontSize: "0.8rem", color: "#46606c" }}>
                {result.latency_ms} ms · model {result.model_used} · safety{" "}
                {result.safety?.passed ? "passed" : "reviewed"}
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}

const labelStyle: CSSProperties = { display: "grid", gap: 4, fontSize: "0.85rem", fontWeight: 600 };
const fieldStyle: CSSProperties = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid var(--line)",
  padding: "0.7rem",
  background: "rgba(255,255,255,0.85)",
  fontWeight: 400,
};
