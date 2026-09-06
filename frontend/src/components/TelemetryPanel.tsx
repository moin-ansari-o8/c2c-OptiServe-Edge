import { Metric } from './Metric';
import { formatNumber, formatTps, formatLatency, formatCacheState } from '@/lib/format';
import type { TelemetryState } from '@/types/telemetry';

interface TelemetryPanelProps {
  telemetry: TelemetryState;
}

export function TelemetryPanel({ telemetry }: TelemetryPanelProps) {
  return (
    <div className="space-y-3">
      <div className="label-tech">Telemetry</div>

      <div className="border border-ink/10 p-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          <Metric
            value={telemetry.tokens || '—'}
            label="Tokens"
            size="sm"
          />
          <Metric
            value={telemetry.tps !== null ? formatNumber(telemetry.tps, 1) : '—'}
            label="Tokens / sec"
            size="sm"
          />
          <Metric
            value={telemetry.latency !== null ? formatLatency(telemetry.latency) : '—'}
            label="Latency"
            size="sm"
          />
          <Metric
            value={telemetry.status.toUpperCase()}
            label="Status"
            size="sm"
          />
          <Metric
            value={formatCacheState(telemetry.cacheHit)}
            label="Cache"
            size="sm"
          />
          <Metric
            value={telemetry.requestId || '—'}
            label="Request ID"
            size="sm"
          />
        </div>

        {/* Live throughput bar */}
        {telemetry.tps !== null && telemetry.tps > 0 && (
          <div className="mt-4 pt-4 border-t border-ink/5">
            <div className="flex items-baseline gap-2">
              <span className="mono-data text-xl font-light">
                {formatTps(telemetry.tps)}
              </span>
              <span className="label-tech">live</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
