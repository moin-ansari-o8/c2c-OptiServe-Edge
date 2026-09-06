import { useState, useCallback } from 'react';
import type { RequestRecord, RequestEvent, RequestStatus } from '@/types/telemetry';
import { generateRequestId } from '@/lib/format';

const STORAGE_KEY = 'optiserve-requests';

function loadFromStorage(): RequestRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as RequestRecord[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(records: RequestRecord[]): void {
  try {
    // Keep only last 100 records
    const trimmed = records.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable
  }
}

export function useRequestHistory() {
  const [requests, setRequests] = useState<RequestRecord[]>(loadFromStorage);

  const createRequest = useCallback((prompt: string): RequestRecord => {
    const record: RequestRecord = {
      id: generateRequestId(),
      prompt,
      response: '',
      startTime: Date.now(),
      endTime: null,
      tokens: 0,
      promptTokens: null,
      tps: null,
      latency: null,
      cacheHit: null,
      status: 'connecting',
      events: [
        {
          id: generateRequestId(),
          timestamp: Date.now(),
          type: 'started',
          message: 'Request started',
        },
      ],
    };

    setRequests((prev) => {
      const next = [...prev, record];
      saveToStorage(next);
      return next;
    });

    return record;
  }, []);

  const updateRequest = useCallback(
    (id: string, updates: Partial<RequestRecord>) => {
      setRequests((prev) => {
        const next = prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
        saveToStorage(next);
        return next;
      });
    },
    [],
  );

  const addEvent = useCallback(
    (requestId: string, event: Omit<RequestEvent, 'id' | 'timestamp'>) => {
      setRequests((prev) => {
        const next = prev.map((r) => {
          if (r.id !== requestId) return r;
          return {
            ...r,
            events: [
              ...r.events,
              { ...event, id: generateRequestId(), timestamp: Date.now() },
            ],
          };
        });
        saveToStorage(next);
        return next;
      });
    },
    [],
  );

  const completeRequest = useCallback(
    (id: string, data: { response: string; tokens: number; tps: number; latency: number; status: RequestStatus }) => {
      setRequests((prev) => {
        const next = prev.map((r) => {
          if (r.id !== id) return r;
          return {
            ...r,
            ...data,
            endTime: Date.now(),
            events: [
              ...r.events,
              {
                id: generateRequestId(),
                timestamp: Date.now(),
                type: 'complete' as const,
                message: `Completed: ${data.tokens} tokens at ${data.tps.toFixed(1)} tok/s`,
              },
            ],
          };
        });
        saveToStorage(next);
        return next;
      });
    },
    [],
  );

  const clearHistory = useCallback(() => {
    setRequests([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { requests, createRequest, updateRequest, addEvent, completeRequest, clearHistory };
}
