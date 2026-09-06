import type { RequestRecord } from '@/types/telemetry';
import { formatTimeShort, formatTps, formatLatency, formatCacheState } from '@/lib/format';

interface RequestTableProps {
  requests: RequestRecord[];
  onSelect: (request: RequestRecord) => void;
  className?: string;
}

export function RequestTable({ requests, onSelect, className = '' }: RequestTableProps) {
  if (requests.length === 0) {
    return (
      <div className={`py-16 text-center ${className}`}>
        <div className="font-mono text-xs uppercase tracking-[0.1em] text-muted mb-2">
          Requests
        </div>
        <p className="text-sm text-muted/70">
          No requests yet. Run your first inference to populate this view.
        </p>
      </div>
    );
  }

  const sorted = [...requests].reverse();

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-ink/10">
            {['Time', 'Request', 'Tokens', 'Speed', 'Cache', 'Latency', 'Status'].map((header) => (
              <th
                key={header}
                className="pb-2 pr-4 font-mono text-2xs uppercase tracking-[0.12em] text-muted font-normal"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((request) => (
            <tr
              key={request.id}
              onClick={() => onSelect(request)}
              className="border-b border-ink/5 hover:bg-cream-dark/30 cursor-pointer transition-colors"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(request)}
              aria-label={`Request ${request.id}`}
            >
              <td className="py-2.5 pr-4 font-mono text-xs text-muted tabular-nums">
                {formatTimeShort(request.startTime)}
              </td>
              <td className="py-2.5 pr-4 font-mono text-xs text-ink">
                {request.id}
              </td>
              <td className="py-2.5 pr-4 font-mono text-xs text-ink tabular-nums">
                {request.tokens || '—'}
              </td>
              <td className="py-2.5 pr-4 font-mono text-xs text-ink tabular-nums">
                {formatTps(request.tps)}
              </td>
              <td className="py-2.5 pr-4 font-mono text-xs text-ink">
                {formatCacheState(request.cacheHit)}
              </td>
              <td className="py-2.5 pr-4 font-mono text-xs text-ink tabular-nums">
                {formatLatency(request.latency)}
              </td>
              <td className="py-2.5 pr-4">
                <span
                  className={`font-mono text-2xs uppercase tracking-[0.1em] px-1.5 py-0.5 border ${
                    request.status === 'complete'
                      ? 'text-ink/60 border-ink/10'
                      : request.status === 'error'
                        ? 'text-error border-error/30'
                        : request.status === 'generating'
                          ? 'text-ink border-accent/40 bg-accent/10'
                          : 'text-muted border-ink/10'
                  }`}
                >
                  {request.status === 'complete' ? 'Done' : request.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

