import { useState, useCallback } from 'react';
import { streamChat } from '@/services/stream';
import { generateRequestId } from '@/lib/format';
import { BENCHMARK_PROMPT, DEFAULT_MODEL, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '@/lib/constants';
import type { BenchmarkResult, BenchmarkRequestResult } from '@/types/telemetry';

interface BenchmarkState {
  running: boolean;
  progress: number;
  total: number;
  results: BenchmarkResult[];
  currentResult: BenchmarkResult | null;
  error: string | null;
}

export function useBenchmark() {
  const [state, setState] = useState<BenchmarkState>({
    running: false,
    progress: 0,
    total: 0,
    results: [],
    currentResult: null,
    error: null,
  });

  const runBenchmark = useCallback(async (concurrency: number) => {
    setState((prev) => ({
      ...prev,
      running: true,
      progress: 0,
      total: concurrency,
      currentResult: null,
      error: null,
    }));

    const startTime = Date.now();
    const requestResults: BenchmarkRequestResult[] = [];

    const runSingleRequest = (): Promise<BenchmarkRequestResult> => {
      return new Promise((resolve) => {
        const id = generateRequestId();
        const reqStart = Date.now();
        let tokenCount = 0;

        streamChat(
          BENCHMARK_PROMPT,
          {
            model: DEFAULT_MODEL,
            maxTokens: DEFAULT_MAX_TOKENS,
            temperature: DEFAULT_TEMPERATURE,
            stream: true,
          },
          {
            onToken: () => {
              tokenCount++;
            },
            onDone: () => {
              const elapsed = (Date.now() - reqStart) / 1000;
              const tps = elapsed > 0 ? tokenCount / elapsed : 0;
              resolve({
                id,
                tokens: tokenCount,
                latency: elapsed,
                tps,
                status: 'complete',
              });
            },
            onError: (error) => {
              resolve({
                id,
                tokens: tokenCount,
                latency: (Date.now() - reqStart) / 1000,
                tps: 0,
                status: 'error',
                error: error.message,
              });
            },
          },
        );
      });
    };

    try {
      // Launch all requests concurrently
      const promises = Array.from({ length: concurrency }, () => runSingleRequest());

      // Track completion
      for (const promise of promises) {
        const result = await promise;
        requestResults.push(result);
        setState((prev) => ({ ...prev, progress: requestResults.length }));
      }

      const totalTime = (Date.now() - startTime) / 1000;
      const completed = requestResults.filter((r) => r.status === 'complete');
      const totalTokens = completed.reduce((sum, r) => sum + r.tokens, 0);
      const avgLatency = completed.length > 0
        ? completed.reduce((sum, r) => sum + r.latency, 0) / completed.length
        : 0;
      const peakThroughput = completed.length > 0
        ? Math.max(...completed.map((r) => r.tps))
        : 0;

      const benchmarkResult: BenchmarkResult = {
        concurrency,
        requests: requestResults,
        totalTime,
        avgLatency,
        peakThroughput,
        totalTokens,
        failedRequests: requestResults.filter((r) => r.status === 'error').length,
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        running: false,
        currentResult: benchmarkResult,
        results: [...prev.results, benchmarkResult],
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        running: false,
        error: (error as Error).message,
      }));
    }
  }, []);

  const clearResults = useCallback(() => {
    setState({
      running: false,
      progress: 0,
      total: 0,
      results: [],
      currentResult: null,
      error: null,
    });
  }, []);

  return { ...state, runBenchmark, clearResults };
}
