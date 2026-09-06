import { API_BASE_URL } from '@/lib/constants';
import type { MetricsResponse } from '@/types/api';

type MetricsHandler = (metrics: MetricsResponse) => void;
type ConnectionHandler = (connected: boolean) => void;

/**
 * WebSocket client for real-time metrics.
 * Falls back gracefully if the backend doesn't support WebSocket yet.
 */
export class MetricsWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private onMetrics: MetricsHandler | null = null;
  private onConnection: ConnectionHandler | null = null;
  private shouldReconnect = true;

  connect(onMetrics: MetricsHandler, onConnection?: ConnectionHandler): void {
    this.onMetrics = onMetrics;
    this.onConnection = onConnection || null;
    this.shouldReconnect = true;
    this.attemptConnection();
  }

  private attemptConnection(): void {
    try {
      const wsBase = API_BASE_URL.replace(/^http/, 'ws') || `ws://${window.location.host}`;
      this.ws = new WebSocket(`${wsBase}/ws/metrics`);

      this.ws.onopen = () => {
        this.onConnection?.(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as MetricsResponse;
          this.onMetrics?.(data);
        } catch {
          // Skip malformed messages
        }
      };

      this.ws.onclose = () => {
        this.onConnection?.(false);
        if (this.shouldReconnect) {
          this.reconnectTimer = setTimeout(() => this.attemptConnection(), 5000);
        }
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      // WebSocket not available
      this.onConnection?.(false);
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.ws?.close();
    this.ws = null;
  }
}
