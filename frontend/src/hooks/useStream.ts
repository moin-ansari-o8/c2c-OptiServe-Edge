import { useState, useCallback, useRef } from 'react';
import { streamChat } from '@/services/stream';
import { generateRequestId } from '@/lib/format';
import type { StreamOptions } from '@/types/api';
import type { RequestStatus, TelemetryState } from '@/types/telemetry';

interface StreamState {
  response: string;
  telemetry: TelemetryState;
  isStreaming: boolean;
  error: string | null;
}

const initialTelemetry: TelemetryState = {
  tokens: 0,
  tps: null,
  latency: null,
  status: 'idle',
  cacheHit: null,
  requestId: null,
};

export function useStream() {
  const [state, setState] = useState<StreamState>({
    response: '',
    telemetry: initialTelemetry,
    isStreaming: false,
    error: null,
  });

  const controllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const tokenCountRef = useRef<number>(0);

  const updateStatus = useCallback((status: RequestStatus) => {
    setState((prev) => ({
      ...prev,
      telemetry: { ...prev.telemetry, status },
    }));
  }, []);

  const send = useCallback(
    (prompt: string, options: Partial<StreamOptions> = {}) => {
      // Cancel any existing stream
      controllerRef.current?.abort();

      const requestId = generateRequestId();
      startTimeRef.current = Date.now();
      tokenCountRef.current = 0;

      setState({
        response: '',
        telemetry: {
          tokens: 0,
          tps: null,
          latency: null,
          status: 'connecting',
          cacheHit: null,
          requestId,
        },
        isStreaming: true,
        error: null,
      });

      controllerRef.current = streamChat(prompt, options, {
        onStart: () => {
          updateStatus('generating');
        },
        onToken: (token) => {
          tokenCountRef.current++;
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          const tps = elapsed > 0 ? tokenCountRef.current / elapsed : 0;

          setState((prev) => ({
            ...prev,
            response: prev.response + token,
            telemetry: {
              ...prev.telemetry,
              tokens: tokenCountRef.current,
              tps,
              latency: elapsed,
              status: 'generating',
            },
          }));
        },
        onDone: (fullText) => {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          const tps = elapsed > 0 ? tokenCountRef.current / elapsed : 0;

          setState((prev) => ({
            ...prev,
            response: fullText,
            telemetry: {
              ...prev.telemetry,
              tokens: tokenCountRef.current,
              tps,
              latency: elapsed,
              status: 'complete',
            },
            isStreaming: false,
          }));
        },
        onError: (error) => {
          setState((prev) => ({
            ...prev,
            telemetry: { ...prev.telemetry, status: 'error' },
            isStreaming: false,
            error: error.message,
          }));
        },
      });

      return requestId;
    },
    [updateStatus],
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    setState((prev) => ({
      ...prev,
      telemetry: { ...prev.telemetry, status: 'cancelled' },
      isStreaming: false,
    }));
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState({
      response: '',
      telemetry: initialTelemetry,
      isStreaming: false,
      error: null,
    });
  }, []);

  return { ...state, send, cancel, reset };
}
