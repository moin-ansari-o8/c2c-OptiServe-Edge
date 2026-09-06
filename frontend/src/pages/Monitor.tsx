import { PageLayout } from '@/components/PageLayout';
import { SectionHeading } from '@/components/SectionHeading';
import { MetricStrip } from '@/components/MetricStrip';
import { SystemEvent } from '@/components/SystemEvent';
import { useMetrics } from '@/hooks/useMetrics';
import { useRequestHistory } from '@/hooks/useRequestHistory';
import { formatNumber } from '@/lib/format';

export function Monitor() {
  const { metrics, available } = useMetrics();
  const { requests } = useRequestHistory();

  // Derive events from request history
  const allEvents = requests
    .flatMap((r) => r.events)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50);

  // Compute aggregate metrics
  const completedRequests = requests.filter((r) => r.status === 'complete');
  const totalTokens = completedRequests.reduce((sum, r) => sum + r.tokens, 0);
  const avgTps =
    completedRequests.length > 0
      ? completedRequests.reduce((sum, r) => sum + (r.tps || 0), 0) / completedRequests.length
      : null;
  const cacheHits = completedRequests.filter((r) => r.cacheHit === true).length;
  const cacheHitRate =
    completedRequests.length > 0 ? ((cacheHits / completedRequests.length) * 100) : null;

  const summaryMetrics = [
    {
      value: available && metrics ? metrics.active_requests : requests.filter((r) => r.status === 'generating').length,
      label: 'Active Requests',
    },
    {
      value: available && metrics ? metrics.total_tokens : totalTokens || '—',
      label: 'Total Tokens',
    },
    {
      value: available && metrics ? formatNumber(metrics.last_tps) : formatNumber(avgTps),
      label: 'Current Throughput',
      unit: avgTps !== null ? 'tok/s' : undefined,
    },
    {
      value: cacheHitRate !== null ? `${cacheHitRate.toFixed(0)}%` : '—',
      label: 'Cache Hit Rate',
    },
  ];

  return (
    <PageLayout>
      <SectionHeading title="Monitor" subtitle="Requests in. Tokens out." />

      {/* Summary metrics */}
      <div className="mb-10">
        <MetricStrip metrics={summaryMetrics} />
      </div>

      {/* Live activity indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="label-tech">System Events</span>
          {requests.some((r) => r.status === 'generating') && (
            <span className="inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-[0.1em] text-accent">
              <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* Event timeline */}
      <div className="border border-ink/10 p-4 max-h-[500px] overflow-y-auto">
        {allEvents.length > 0 ? (
          <div className="divide-y divide-ink/5">
            {allEvents.map((event) => (
              <SystemEvent
                key={event.id}
                timestamp={event.timestamp}
                message={event.message}
                type={
                  event.type === 'complete'
                    ? 'success'
                    : event.type === 'error'
                      ? 'error'
                      : 'info'
                }
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="font-mono text-xs uppercase tracking-[0.1em] text-muted mb-2">
              No Events
            </div>
            <p className="text-sm text-muted/70">
              Run inference from the Console to see live system events.
            </p>
          </div>
        )}
      </div>

      {/* Active requests */}
      {requests.filter((r) => r.status === 'generating' || r.status === 'connecting').length > 0 && (
        <div className="mt-8">
          <div className="label-tech mb-3">Active Requests</div>
          <div className="space-y-2">
            {requests
              .filter((r) => r.status === 'generating' || r.status === 'connecting')
              .map((r) => (
                <div key={r.id} className="flex items-center gap-4 p-3 border border-ink/10">
                  <span className="font-mono text-xs text-ink">{r.id}</span>
                  <span className="font-mono text-2xs uppercase tracking-[0.1em] text-accent">
                    {r.status}
                  </span>
                  <span className="font-mono text-xs text-muted tabular-nums ml-auto">
                    {r.tokens} tokens
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
