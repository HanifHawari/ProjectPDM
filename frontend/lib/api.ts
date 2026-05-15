import { Application, ApplicationListResponse, AnalyticsSummary, PredictRequest, PredictResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token") ?? null;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "API error");
  }
  return res.json();
}


export async function predict(data: PredictRequest): Promise<PredictResponse> {
  return apiFetch<PredictResponse>("/api/predict", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


export interface ListParams {
  page?: number;
  page_size?: number;
  loan_purpose?: string;
  property_area?: string;
  employment_status?: string;
  status?: string;
}

export async function listApplications(params: ListParams = {}): Promise<ApplicationListResponse> {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, String(v)); });
  return apiFetch<ApplicationListResponse>(`/api/applications?${q}`);
}

export async function createApplication(data: Partial<Application>): Promise<Application> {
  return apiFetch<Application>("/api/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateApplication(id: string, status: string, officerName?: string): Promise<Application> {
  return apiFetch<Application>(`/api/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, officer_name: officerName }),
  });
}


export async function fetchSummary(): Promise<AnalyticsSummary> {
  return apiFetch<AnalyticsSummary>("/api/analytics/summary");
}
