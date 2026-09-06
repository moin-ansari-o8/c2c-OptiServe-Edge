export type RequestStatus =
  | 'idle'
  | 'connecting'
  | 'scheduling'
  | 'generating'
  | 'complete'
  | 'error'
  | 'cancelled';

export interface RequestEvent {
  id: string;
  timestamp: number;
  type: 'started' | 'cache_check' | 'batch_assigned' | 'generating' | 'complete' | 'error';
  message: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface RequestRecord {
  id: string;
  prompt: string;
  response: string;
  startTime: number;
  endTime: number | null;
  tokens: number;
  promptTokens: number | null;
  tps: number | null;
  latency: number | null;
  cacheHit: boolean | null;
  status: RequestStatus;
  events: RequestEvent[];
}

export interface TelemetryState {
  tokens: number;
  tps: number | null;
  latency: number | null;
  status: RequestStatus;
  cacheHit: boolean | null;
  requestId: string | null;
}

export interface BenchmarkResult {
  concurrency: number;
  requests: BenchmarkRequestResult[];
  totalTime: number;
  avgLatency: number;
  peakThroughput: number;
  totalTokens: number;
  failedRequests: number;
  timestamp: number;
}

export interface BenchmarkRequestResult {
  id: string;
  tokens: number;
  latency: number;
  tps: number;
  status: 'complete' | 'error';
  error?: string;
}
