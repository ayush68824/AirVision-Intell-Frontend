"use client";

import Link from "next/link";
import { CSSProperties, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "register") {
        await register(email, password, "AirVision User");
      }
      const tokens = await login(email, password);
      localStorage.setItem("airvision_access", tokens.access_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (mode === "register") {
        try {
          const tokens = await login(email, password);
          localStorage.setItem("airvision_access", tokens.access_token);
          router.push("/dashboard");
          return;
        } catch {
          /* fall through */
        }
      }
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1rem" }}>
      <form
        className="panel rise"
        onSubmit={onSubmit}
        style={{ width: "min(420px, 100%)", padding: "1.5rem", display: "grid", gap: "0.8rem" }}
      >
        <div className="brand" style={{ fontSize: "1.7rem" }}>
          AirVision Intelligence
        </div>
        <p style={{ margin: 0, color: "#46606c" }}>Sign in to access your workspace and saved preferences.</p>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          style={fieldStyle}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="Password"
          style={fieldStyle}
        />
        <button className="btn btn-primary" type="submit">
          {mode === "register" ? "Create account" : "Sign in"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          Switch to {mode === "login" ? "register" : "login"}
        </button>
        {error && <div style={{ color: "var(--danger)", fontSize: "0.9rem" }}>{error}</div>}
        <Link href="/" style={{ color: "#1f6f8b" }}>
          Back to home
        </Link>
      </form>
    </main>
  );
}

const fieldStyle: CSSProperties = {
  borderRadius: 12,
  border: "1px solid var(--line)",
  padding: "0.85rem 0.95rem",
  background: "rgba(255,255,255,0.85)",
};
