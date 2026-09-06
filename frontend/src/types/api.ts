/* ── Chat Completion ── */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens: number;
  temperature: number;
  stream: boolean;
}

export interface ChatCompletionChoice {
  index: number;
  delta?: { content?: string; role?: string };
  message?: { role: string; content: string };
  finish_reason: string | null;
}

export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/* ── Health ── */

export interface HealthResponse {
  status: string;
  model?: string;
  engine?: string;
}

/* ── Metrics ── */

export interface MetricsResponse {
  active_requests: number;
  completed_requests: number;
  total_tokens: number;
  last_latency: number | null;
  last_tps: number | null;
  cache_hits: number;
}

/* ── Stream Callbacks ── */

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: Error) => void;
  onStart?: () => void;
}

export interface StreamOptions {
  model: string;
  maxTokens: number;
  temperature: number;
  stream: boolean;
}
