import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="container" style={{ padding: "2rem 0 4rem" }}>
      <Link href="/" className="brand" style={{ fontSize: "1.3rem" }}>
        AirVision Intelligence
      </Link>
      <h1 className="brand" style={{ fontSize: "2.6rem", marginTop: "1.5rem" }}>
        Platform overview
      </h1>
      <p style={{ maxWidth: 720, color: "#35505c" }}>
        The frontend connects to the AirVision API for air-quality readings, multi-horizon forecasts, route
        optimization, and decision explanations with citations.
      </p>
      <ol style={{ lineHeight: 1.7, color: "#0e1a24" }}>
        <li>Command Center shows current AQI/PM2.5 and forecast bands.</li>
        <li>Route Lab compares time, exposure, and estimated inhaled dose.</li>
        <li>Decision Workspace walks through journey definition, alternatives, and evidence.</li>
        <li>Forecast and Operations views surface model and data-status details.</li>
        <li>Guidance is environmental decision support, not medical diagnosis.</li>
      </ol>
      <Link href="/dashboard" className="btn btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>
        Open command center
      </Link>
    </main>
  );
}
