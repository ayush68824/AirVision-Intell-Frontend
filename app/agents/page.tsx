"use client";

import { FormEvent, useState } from "react";
import AppShell from "@/components/AppShell";
import { agentQuery, AgentResponse, CP, INDIA_GATE } from "@/lib/api";

export default function AgentsPage() {
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await agentQuery({
        message:
          "I have asthma. Travel from Connaught Place to India Gate tomorrow at 8 AM. Compare exposure and leave-earlier options.",
        origin: CP,
        destination: INDIA_GATE,
        mode: "walk",
        health_profile: { conditions: ["asthma"], sensitivity: "high" },
      });
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Agent run failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell demoMode={result?.demo_mode ?? true}>
      <h1 className="brand" style={{ marginTop: 0, fontSize: "2rem" }}>
        Agent Intelligence Center
      </h1>
      <p className="muted">Workflow visualization, tool status, citations, prompt/model versions, latency.</p>
      <form onSubmit={run} style={{ margin: "1rem 0" }}>
        <button className="btn btn-primary" disabled={loading} type="submit">
          {loading ? "Executing graph…" : "Run orchestrated demo query"}
        </button>
      </form>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      {result && (
        <div style={{ display: "grid", gap: "1rem" }}>
          <div className="stat-grid">
            <div className="panel" style={{ padding: "1rem" }}>
              <div className="muted">Model</div>
              <strong>{result.model_used}</strong>
            </div>
            <div className="panel" style={{ padding: "1rem" }}>
              <div className="muted">Latency</div>
              <strong>{result.latency_ms} ms</strong>
            </div>
            <div className="panel" style={{ padding: "1rem" }}>
              <div className="muted">Prompt</div>
              <strong>orchestrator@v1.0.0</strong>
            </div>
            <div className="panel" style={{ padding: "1rem" }}>
              <div className="muted">Safety</div>
              <strong>{result.safety?.passed ? "passed" : "reviewed"}</strong>
            </div>
          </div>

          <div className="panel" style={{ padding: "1rem" }}>
            <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Execution trace</h2>
            <ol>
              {(result.agent_trace || []).map((s, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  <strong>{s.agent}</strong> — {s.status} / {s.data_class}
                  <div className="muted">{s.detail}</div>
                </li>
              ))}
            </ol>
          </div>

          <div className="panel" style={{ padding: "1rem" }}>
            <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Retrieved evidence</h2>
            <ul>
              {(result.citations || []).map((c) => (
                <li key={c.title}>
                  {c.title} ({c.source}) — relevance {c.relevance}
                </li>
              ))}
            </ul>
            <p className="muted" style={{ fontSize: "0.85rem" }}>
              Health-related outputs are advisory environmental guidance only. The system does not take autonomous
              actions on behalf of the user.
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
