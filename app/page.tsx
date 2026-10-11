import Link from "next/link";

export default function LandingPage() {
  return (
    <main>
      <section
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          display: "grid",
          alignContent: "end",
          padding: "1.25rem 0 3.5rem",
        }}
      >
        <div
          aria-hidden
          className="drift"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(14,26,36,0.15) 0%, rgba(14,26,36,0.55) 100%), url('https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=2000&q=80') center/cover",
            zIndex: 0,
          }}
        />
        <div className="container" style={{ position: "relative", zIndex: 1, color: "white" }}>
          <nav
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "28vh",
            }}
          >
            <div className="brand" style={{ fontSize: "1.15rem" }}>
              AirVision Intelligence
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link href="/login" className="btn btn-secondary" style={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
                Sign in
              </Link>
              <Link href="/dashboard" className="btn btn-primary" style={{ background: "#f4f7f8", color: "#0f3d4c" }}>
                Open command center
              </Link>
            </div>
          </nav>

          <div className="rise" style={{ maxWidth: 720 }}>
            <h1
              className="brand"
              style={{
                fontSize: "clamp(2.8rem, 7vw, 5.2rem)",
                lineHeight: 0.95,
                margin: "0 0 1rem",
                letterSpacing: "-0.04em",
              }}
            >
              AirVision Intelligence
            </h1>
            <p style={{ fontSize: "1.15rem", maxWidth: 540, opacity: 0.92, marginBottom: "1.5rem" }}>
              An agentic environmental digital twin that forecasts pollution, optimizes exposure-aware routes, and
              explains decisions with evidence.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/dashboard" className="btn btn-primary" style={{ background: "#d97706" }}>
                Open command center
              </Link>
              <Link href="/app" className="btn btn-secondary" style={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
                Decision workspace
              </Link>
              <Link href="/docs" className="btn btn-secondary" style={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
                Platform overview
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: "4.5rem 0" }}>
        <h2 className="brand rise" style={{ fontSize: "2.4rem", marginBottom: "0.75rem" }}>
          Built for measurable environmental decisions
        </h2>
        <p className="rise" style={{ maxWidth: 640, color: "#35505c", marginBottom: "2rem" }}>
          Forecasts, route exposure estimates, scientific references, and verification steps are coordinated so
          recommendations stay tied to data and clear assumptions.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {[
            ["Predictive ML", "Multi-horizon PM2.5 with prediction intervals"],
            ["Geospatial routing", "Map overlays and inhaled-dose comparisons"],
            ["Tool-backed agents", "Orchestrated workflows with evidence traces"],
            ["Reliability", "Demo labels, freshness checks, and safe fallbacks"],
          ].map(([title, body]) => (
            <div key={title} className="panel rise" style={{ padding: "1.25rem" }}>
              <h3 style={{ margin: "0 0 0.4rem", fontFamily: "var(--font-display)" }}>{title}</h3>
              <p style={{ margin: 0, color: "#46606c" }}>{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
