const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type LatLng = { lat: number; lng: number };

export type AgentResponse = {
  session_id: string;
  answer: string;
  plan: string[];
  forecast?: any;
  routes?: any;
  citations?: any[];
  simulation?: any;
  vision?: any;
  safety?: any;
  evidence?: any;
  latency_ms: number;
  model_used: string;
  demo_mode?: boolean;
  data_mode?: string;
  agent_trace?: Array<{
    agent: string;
    status: string;
    detail: string;
    latency_ms: number;
    data_class: string;
  }>;
  requested_departure_at?: string;
  forecast_horizon_hours?: number;
  medical_disclaimer?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function getApiUrl() {
  return API_URL;
}

export async function getHealth() {
  return request<{ status: string; version: string; llm_configured: boolean; services: Record<string, string> }>(
    "/health"
  );
}

export async function register(email: string, password: string, full_name?: string) {
  return request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name }),
  });
}

export async function login(email: string, password: string) {
  return request<{ access_token: string; refresh_token: string }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function agentQuery(payload: {
  message: string;
  origin?: LatLng;
  destination?: LatLng;
  departure_at?: string;
  mode?: string;
  health_profile?: { conditions: string[]; sensitivity: string };
  include_simulation?: boolean;
}): Promise<AgentResponse> {
  return request("/api/v1/agent/query", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getForecast(location: LatLng, horizons = [1, 6, 12, 24]) {
  return request("/api/v1/forecast", {
    method: "POST",
    body: JSON.stringify({ location, horizons_hours: horizons, city: "Delhi" }),
  });
}

export async function optimizeRoutes(payload: {
  origin: LatLng;
  destination: LatLng;
  mode?: string;
  departure_at?: string;
  health_profile?: { conditions: string[]; sensitivity: string };
}) {
  return request("/api/v1/routes/optimize", {
    method: "POST",
    body: JSON.stringify({
      mode: "walk",
      ...payload,
    }),
  });
}

export async function latestAqi(city = "Delhi") {
  return request<any[]>(`/api/v1/aqi/latest?city=${encodeURIComponent(city)}`);
}

export async function simulateDeparture(payload: {
  origin: LatLng;
  destination: LatLng;
  base_departure: string;
  offsets_minutes?: number[];
  mode?: string;
}) {
  return request("/api/v1/agent/simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export const CP = { lat: 28.6315, lng: 77.2167 };
export const INDIA_GATE = { lat: 28.6129, lng: 77.2295 };
