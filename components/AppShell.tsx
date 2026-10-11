"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Command Center" },
  { href: "/routes", label: "Route Lab" },
  { href: "/app", label: "Decision Workspace" },
  { href: "/forecasts", label: "Forecasts" },
  { href: "/agents", label: "Agents" },
  { href: "/simulation", label: "Digital Twin" },
  { href: "/operations", label: "Operations" },
];

export default function AppShell({
  children,
  demoMode = true,
}: {
  children: React.ReactNode;
  demoMode?: boolean;
}) {
  const path = usePathname();
  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        style={{
          borderBottom: "1px solid var(--line)",
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "0.85rem 0",
            flexWrap: "wrap",
          }}
        >
          <div>
            <Link href="/" className="brand" style={{ fontSize: "1.25rem" }}>
              AirVision Intelligence
            </Link>
            <div style={{ fontSize: "0.82rem", color: "#46606c" }}>
              Environmental decision workspace · {demoMode ? "Demo data" : "Live sources"}
            </div>
          </div>
          {demoMode && (
            <span
              style={{
                background: "#d97706",
                color: "white",
                fontWeight: 700,
                fontSize: "0.75rem",
                padding: "0.35rem 0.7rem",
                borderRadius: 999,
              }}
            >
              Demo mode
            </span>
          )}
        </div>
        <nav
          className="container"
          style={{
            display: "flex",
            gap: "0.35rem",
            overflowX: "auto",
            paddingBottom: "0.7rem",
          }}
        >
          {LINKS.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: "0.45rem 0.8rem",
                  borderRadius: 999,
                  fontSize: "0.88rem",
                  fontWeight: active ? 700 : 500,
                  background: active ? "var(--sky-deep)" : "transparent",
                  color: active ? "white" : "var(--ink)",
                  whiteSpace: "nowrap",
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="container" style={{ padding: "1.25rem 0 2.5rem" }}>
        {children}
      </div>
    </div>
  );
}
