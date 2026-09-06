import { API_BASE_URL } from '@/lib/constants';
import type { HealthResponse, MetricsResponse } from '@/types/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function checkHealth(): Promise<HealthResponse> {
  try {
    return await request<HealthResponse>('/health');
  } catch {
    return { status: 'offline' };
  }
}

export async function fetchMetrics(): Promise<MetricsResponse | null> {
  try {
    return await request<MetricsResponse>('/metrics');
  } catch {
    return null;
  }
}
