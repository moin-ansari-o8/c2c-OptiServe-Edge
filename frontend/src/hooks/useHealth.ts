import { useState, useEffect, useCallback, useRef } from 'react';
import { checkHealth } from '@/services/api';
import { HEALTH_POLL_INTERVAL } from '@/lib/constants';

interface HealthState {
  online: boolean;
  model: string | null;
  engine: string | null;
  checking: boolean;
}

export function useHealth() {
  const [state, setState] = useState<HealthState>({
    online: false,
    model: null,
    engine: null,
    checking: true,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const check = useCallback(async () => {
    try {
      const data = await checkHealth();
      setState({
        online: data.status === 'ok',
        model: data.model || null,
        engine: data.engine || null,
        checking: false,
      });
    } catch {
      setState((prev) => ({ ...prev, online: false, checking: false }));
    }
  }, []);

  useEffect(() => {
    check();
    intervalRef.current = setInterval(check, HEALTH_POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [check]);

  return state;
}
