# OptiServe-Edge: Frontend & Backend Merge Guide

This document is intended for AI agents or developers tasked with connecting the OptiServe-Edge backend (FastAPI/vLLM) to the existing React frontend.

## 1. Architecture Overview
- **Frontend**: React + Vite + Tailwind CSS. Runs on port `5173`.
- **Backend**: Python + FastAPI + vLLM. Must run on port `8000`.
- **API Base URL**: The frontend expects the backend to be available at `http://localhost:8000/v1` (or `http://localhost:8000` for root endpoints).

## 2. CORS Requirements
The backend **must** have CORS enabled to accept requests from `http://localhost:5173`.
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 3. Required Endpoints

The frontend strictly expects the following endpoints to be implemented:

### A. Health Check
- **Endpoint**: `GET /health`
- **Purpose**: Used by the frontend sidebar to show "LOCAL ●" (Online) or "LOCAL ○" (Offline).
- **Expected Response**:
  ```json
  {
    "status": "ok",
    "model": "qwen1.5-1.8b-chat",
    "engine": "vllm"
  }
  ```

### B. Telemetry & Metrics
- **Endpoint**: `GET /metrics`
- **Purpose**: Feeds the "Monitor" dashboard and right-hand telemetry panels.
- **Expected Response**:
  ```json
  {
    "active_requests": 2,
    "total_tokens": 14500,
    "last_tps": 45.2,
    "gpu_memory_used_gb": 1.2
  }
  ```

### C. Chat Completions (Streaming)
- **Endpoint**: `POST /v1/chat/completions`
- **Purpose**: Core inference endpoint. Drives the "Console", "Benchmark", and "Agents" pages.
- **Expected Payload** (OpenAI-compatible):
  ```json
  {
    "model": "default",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 512,
    "temperature": 0.7,
    "stream": true
  }
  ```
- **Expected Response**: Server-Sent Events (SSE). 
  - Each chunk must be prefixed with `data: `
  - The chunk payload must match the OpenAI chunk schema:
    ```json
    data: {"choices": [{"delta": {"content": "Hello"}}]}
    ```
  - The stream **must** terminate with exactly `data: [DONE]`.

## 4. Telemetry Header (Crucial for Metrics)
To provide real-time request metrics (Tokens, TPS, Latency) back to the frontend, the backend should ideally send custom headers or append metadata to the final chunk. Currently, the frontend parses the stream duration to calculate TPS locally, but it looks for the following custom metadata if available in the final chunk:
- `usage`: `{ "completion_tokens": 120 }`
- `metrics`: `{ "tps": 45.2, "latency_ms": 1200, "cache_hit": true }`

## 5. Merging Checklist for the AI Agent
If you are an AI reading this to finish the backend integration, follow this checklist:
- [ ] 1. Ensure `FastAPI` app includes the CORS middleware allowing `localhost:5173`.
- [ ] 2. Implement `@app.get("/health")` returning the JSON schema above.
- [ ] 3. Implement `@app.get("/metrics")` pulling real stats from the vLLM engine.
- [ ] 4. Ensure `/v1/chat/completions` streams correctly and terminates with `data: [DONE]`.
- [ ] 5. Test the integration by running `python -m src.server` and checking the frontend Console page.
