import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { BenchmarkResult } from '@/types/telemetry';

interface BenchmarkChartProps {
  results: BenchmarkResult[];
  metric: 'peakThroughput' | 'avgLatency' | 'totalTokens';
  className?: string;
}

const METRIC_LABELS: Record<string, string> = {
  peakThroughput: 'Peak Throughput (tok/s)',
  avgLatency: 'Avg Latency (s)',
  totalTokens: 'Total Tokens',
};

export function BenchmarkChart({ results, metric, className = '' }: BenchmarkChartProps) {
  if (results.length === 0) return null;

  const data = results.map((r) => ({
    concurrency: `${r.concurrency}x`,
    value: Number(r[metric].toFixed(2)),
    concurrencyNum: r.concurrency,
  }));

  return (
    <div className={className}>
      <div className="label-tech mb-3">{METRIC_LABELS[metric]}</div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#10101010" vertical={false} />
            <XAxis
              dataKey="concurrency"
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#8A8A7A' }}
              axisLine={{ stroke: '#10101015' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#8A8A7A' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#F6F4E8',
                border: '1px solid #10101015',
                borderRadius: 2,
                fontSize: 11,
                fontFamily: 'JetBrains Mono',
              }}
            />
            <Bar dataKey="value" radius={[1, 1, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={index} fill={index === data.length - 1 ? '#BEEB59' : '#10101020'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
