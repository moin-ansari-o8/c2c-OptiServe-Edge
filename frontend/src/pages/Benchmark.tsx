import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { SectionHeading } from '@/components/SectionHeading';
import { MetricStrip } from '@/components/MetricStrip';
import { BenchmarkChart } from '@/components/BenchmarkChart';
import { useBenchmark } from '@/hooks/useBenchmark';
import { CONCURRENCY_OPTIONS } from '@/lib/constants';
import { formatNumber, formatLatency } from '@/lib/format';
import { motion } from 'framer-motion';

export function Benchmark() {
  const [concurrency, setConcurrency] = useState<number>(2);
  const benchmark = useBenchmark();

  const handleRun = () => {
    if (!benchmark.running) {
      benchmark.runBenchmark(concurrency);
    }
  };

  const summaryMetrics = benchmark.currentResult
    ? [
        { value: formatNumber(benchmark.currentResult.peakThroughput), label: 'Peak Throughput', unit: 'tok/s' },
        { value: formatLatency(benchmark.currentResult.avgLatency), label: 'Avg Latency' },
        { value: benchmark.currentResult.failedRequests, label: 'Failed Requests' },
        { value: benchmark.currentResult.totalTokens, label: 'Total Tokens' },
      ]
    : null;

  return (
    <PageLayout>
      <SectionHeading title="Benchmark" subtitle="Measure what matters." />

      {/* Controls */}
      <div className="mb-10 space-y-6">
        <div>
          <div className="label-tech mb-3">Concurrency</div>
          <div className="flex gap-1">
            {CONCURRENCY_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setConcurrency(opt)}
                disabled={benchmark.running}
                className={`
                  px-4 py-2 font-mono text-xs uppercase tracking-[0.08em]
                  border transition-colors duration-200
                  ${concurrency === opt
                    ? 'bg-ink text-cream border-ink'
                    : 'bg-transparent text-ink/50 border-ink/15 hover:text-ink hover:border-ink/30'}
                  disabled:opacity-40 disabled:cursor-not-allowed
                `}
              >
                {opt} {opt === 1 ? 'agent' : 'agents'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRun}
            disabled={benchmark.running}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {benchmark.running ? 'Running...' : 'Run Stress Test'}
          </button>

          {benchmark.results.length > 0 && (
            <button
              onClick={benchmark.clearResults}
              disabled={benchmark.running}
              className="btn-secondary"
            >
              Clear Results
            </button>
          )}
        </div>

        {/* Progress */}
        {benchmark.running && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs text-ink/60">
              {benchmark.progress} / {benchmark.total} requests complete
            </span>
          </motion.div>
        )}
      </div>

      {/* Results */}
      {summaryMetrics ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          {/* Summary strip */}
          <div className="p-6 border border-ink/10">
            <div className="label-tech mb-4">Benchmark Summary</div>
            <MetricStrip metrics={summaryMetrics} />
          </div>

          {/* Charts */}
          {benchmark.results.length > 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border border-ink/10 p-4">
                <BenchmarkChart
                  results={benchmark.results}
                  metric="peakThroughput"
                />
              </div>
              <div className="border border-ink/10 p-4">
                <BenchmarkChart
                  results={benchmark.results}
                  metric="avgLatency"
                />
              </div>
            </div>
          )}

          {/* Per-request detail */}
          {benchmark.currentResult && (
            <div>
              <div className="label-tech mb-3">Request Detail</div>
              <div className="border border-ink/10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-ink/10">
                      {['ID', 'Tokens', 'Latency', 'Throughput', 'Status'].map((h) => (
                        <th key={h} className="px-4 py-2 font-mono text-2xs uppercase tracking-[0.12em] text-muted font-normal">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {benchmark.currentResult.requests.map((r) => (
                      <tr key={r.id} className="border-b border-ink/5">
                        <td className="px-4 py-2 font-mono text-xs text-ink">{r.id}</td>
                        <td className="px-4 py-2 font-mono text-xs text-ink tabular-nums">{r.tokens}</td>
                        <td className="px-4 py-2 font-mono text-xs text-ink tabular-nums">{formatLatency(r.latency)}</td>
                        <td className="px-4 py-2 font-mono text-xs text-ink tabular-nums">{formatNumber(r.tps)} tok/s</td>
                        <td className="px-4 py-2">
                          <span className={`font-mono text-2xs uppercase tracking-[0.1em] ${
                            r.status === 'complete' ? 'text-ink/60' : 'text-error'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        !benchmark.running && (
          <div className="py-20 text-center">
            <div className="font-mono text-xs uppercase tracking-[0.1em] text-muted mb-2">
              No Measurement Yet
            </div>
            <p className="text-sm text-muted/60">
              Select a concurrency level and run the stress test to measure throughput.
            </p>
          </div>
        )
      )}

      {/* Error */}
      {benchmark.error && (
        <div className="mt-6 p-4 border border-error/30">
          <div className="font-mono text-xs uppercase tracking-[0.1em] text-error mb-1">
            Benchmark Failed
          </div>
          <p className="text-sm text-error/80">{benchmark.error}</p>
        </div>
      )}
    </PageLayout>
  );
}
