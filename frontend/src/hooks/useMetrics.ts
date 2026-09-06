import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchMetrics } from '@/services/api';
import { METRICS_POLL_INTERVAL } from '@/lib/constants';
import type { MetricsResponse } from '@/types/api';

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [available, setAvailable] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    const data = await fetchMetrics();
    if (data) {
      setMetrics(data);
      setAvailable(true);
    } else {
      setAvailable(false);
    }
  }, []);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, METRICS_POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll]);

  return { metrics, available };
}
