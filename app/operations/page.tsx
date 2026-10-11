"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { getApiUrl, getHealth } from "@/lib/api";

export default function OperationsPage() {
  const [health, setHealth] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <AppShell>
      <h1 className="brand" style={{ marginTop: 0, fontSize: "2rem" }}>
        Model & Data Operations
      </h1>
      <p className="muted">Internal reliability surface — ingestion, health, model registry, evals.</p>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <div className="stat-grid" style={{ margin: "1rem 0" }}>
        <div className="panel" style={{ padding: "1rem" }}>
          <div className="muted">API</div>
          <strong>{health?.status || "—"}</strong>
          <div className="muted">{getApiUrl()}</div>
        </div>
        <div className="panel" style={{ padding: "1rem" }}>
          <div className="muted">Version</div>
          <strong>{health?.version || "—"}</strong>
        </div>
        <div className="panel" style={{ padding: "1rem" }}>
          <div className="muted">LLM configured</div>
          <strong>{String(health?.llm_configured)}</strong>
        </div>
        <div className="panel" style={{ padding: "1rem" }}>
          <div className="muted">RAG</div>
          <strong>{health?.services?.rag || "—"}</strong>
        </div>
      </div>

      <div className="panel" style={{ padding: "1rem" }}>
        <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Service map</h2>
        <ul>
          {Object.entries(health?.services || {}).map(([k, v]) => (
            <li key={k}>
              {k}: {String(v)}
            </li>
          ))}
        </ul>
        <h3 style={{ fontFamily: "var(--font-display)" }}>Bootstrap model validation</h3>
        <p className="muted" style={{ fontSize: "0.9rem" }}>
          Current forecaster artifact reports MAE ≈ 9.9 and RMSE ≈ 12.5 on held-out synthetic Delhi-like panels.
          Replace with rolling station backtests before public reliability claims. Metrics endpoint:{" "}
          <code>/metrics</code>. Eval harness: <code>python -m app.evals.runner</code>.
        </p>
        <h3 style={{ fontFamily: "var(--font-display)" }}>SLO targets (draft)</h3>
        <ul className="muted">
          <li>Agent p95 latency &lt; 5s offline tools / &lt; 12s with LLM</li>
          <li>AQI freshness alert when observation age &gt; 180 min</li>
          <li>Graceful fallback when LLM/Qdrant/WAQI unavailable</li>
        </ul>
      </div>
    </AppShell>
  );
}
