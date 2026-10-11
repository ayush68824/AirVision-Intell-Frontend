const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://airviision-intell-backend.onrender.com";

export type LatLng = { lat: number; lng: number };

export type RouteMetrics = {
  distance_m: number;
  duration_min: number;
  mean_pm25: number;
  peak_pm25: number;
  inhaled_dose_ug: number;
  exposure_score: number;
  pm25_p10?: number;
  pm25_p90?: number;
  ventilation_m3_per_min?: number;
  dose_formula?: string;
};

export type RouteOption = {
  id: string;
  label: string;
  geometry: LatLng[];
  metrics: RouteMetrics;
  rationale: string;
  path_nodes?: number;
  is_duplicate_geometry?: boolean;
};

export type RouteResponse = {
  origin: LatLng;
  destination: LatLng;
  mode: string;
  options: RouteOption[];
  recommendation_id: string;
  leave_earlier_suggestion?: {
    recommended_offset_minutes?: number;
    reason?: string;
    comparisons?: Array<{
      offset_minutes: number;
      departure_at?: string;
      mean_pm25?: number;
      inhaled_dose_ug?: number;
      duration_min?: number;
      route_id?: string;
    }>;
  } | null;
  exposure_assumptions?: {
    formula?: string;
    ventilation_m3_per_min?: number;
    ambient_unit?: string;
    dose_unit?: string;
    speed_m_per_min?: number;
    caveat?: string;
  };
  alternatives_distinct?: boolean;
  identity_note?: string;
  data_mode?: string;
  departure_at?: string;
  base_pm25?: number;
  medical_disclaimer?: string;
};

export type ForecastHorizon = {
  horizon_hours: number;
  target_at?: string;
  pm25_mean: number;
  pm25_p10: number;
  pm25_p90: number;
  aqi_estimate: number;
  category: string;
  uncertainty_note?: string;
};

export type ForecastResponse = {
  model_name: string;
  model_version: string;
  location: LatLng;
  generated_at?: string;
  horizons: ForecastHorizon[];
  data_freshness?: {
    stations?: number;
    sources?: string[];
    latest_observed_at?: string;
    quality_ok?: boolean;
    interpolation?: { method?: string; pm25?: number; stations_used?: number };
  };
};

export type AqiReading = {
  station_id: string;
  station_name: string;
  location: LatLng;
  city: string;
  pm25?: number | null;
  pm10?: number | null;
  aqi?: number | null;
  source: string;
  observed_at: string;
  quality_flags?: Record<string, unknown>;
};

export type AgentResponse = {
  session_id: string;
  answer: string;
  plan: string[];
  forecast?: ForecastResponse;
  routes?: RouteResponse;
  citations?: Array<{ title: string; source: string; url?: string; snippet?: string; relevance?: number }>;
  simulation?: Record<string, unknown>;
  vision?: Record<string, unknown>;
  safety?: { passed?: boolean; flags?: string[] };
  evidence?: Record<string, unknown>;
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
  return request<ForecastResponse>("/api/v1/forecast", {
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
  return request<RouteResponse>("/api/v1/routes/optimize", {
    method: "POST",
    body: JSON.stringify({
      mode: "walk",
      ...payload,
    }),
  });
}

export async function latestAqi(city = "Delhi") {
  return request<AqiReading[]>(`/api/v1/aqi/latest?city=${encodeURIComponent(city)}`);
}

export type SimulationScenario = {
  offset_minutes: number;
  departure_at?: string;
  recommendation_id?: string;
  duration_min?: number;
  mean_pm25?: number;
  inhaled_dose_ug: number;
  exposure_score?: number;
  by_route?: Record<string, { inhaled_dose_ug?: number; mean_pm25?: number; duration_min?: number }>;
  alternatives_distinct?: boolean;
};

export type SimulationResponse = {
  scenarios?: SimulationScenario[];
  best_offset_minutes?: number;
  recommendation?: string;
  assumptions?: string;
};

export async function simulateDeparture(payload: {
  origin: LatLng;
  destination: LatLng;
  base_departure: string;
  offsets_minutes?: number[];
  mode?: string;
}) {
  return request<SimulationResponse>("/api/v1/agent/simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export const CP = { lat: 28.6315, lng: 77.2167 };
export const INDIA_GATE = { lat: 28.6129, lng: 77.2295 };
