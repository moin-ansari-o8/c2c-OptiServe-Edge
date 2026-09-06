import type { RequestRecord } from '@/types/telemetry';
import { formatTime, formatTps, formatLatency, formatCacheState } from '@/lib/format';
import { RequestTimeline } from './RequestTimeline';
import { motion } from 'framer-motion';

interface RequestDetailProps {
  request: RequestRecord;
  onClose: () => void;
}

export function RequestDetail({ request, onClose }: RequestDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="border border-ink/10 p-6"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="label-tech mb-1">Request Details</div>
          <div className="font-mono text-sm text-ink">{request.id}</div>
        </div>
        <button
          onClick={onClose}
          className="font-mono text-2xs uppercase tracking-[0.1em] text-muted hover:text-ink transition-colors px-2 py-1 border border-ink/10"
          aria-label="Close request detail"
        >
          Close
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-ink/5">
        <div>
          <div className="label-tech mb-1">Tokens</div>
          <div className="mono-data text-sm">{request.tokens || '—'}</div>
        </div>
        <div>
          <div className="label-tech mb-1">Speed</div>
          <div className="mono-data text-sm">{formatTps(request.tps)}</div>
        </div>
        <div>
          <div className="label-tech mb-1">Latency</div>
          <div className="mono-data text-sm">{formatLatency(request.latency)}</div>
        </div>
        <div>
          <div className="label-tech mb-1">Cache</div>
          <div className="mono-data text-sm">{formatCacheState(request.cacheHit)}</div>
        </div>
      </div>

      {/* Prompt */}
      <div className="mb-6">
        <div className="label-tech mb-2">Prompt</div>
        <div className="text-sm text-ink/80 bg-cream-dark/20 p-3 border border-ink/5">
          {request.prompt}
        </div>
      </div>

      {/* Response */}
      {request.response && (
        <div className="mb-6">
          <div className="label-tech mb-2">Response</div>
          <div className="text-sm text-ink/80 bg-cream-dark/20 p-3 border border-ink/5 max-h-[200px] overflow-y-auto whitespace-pre-wrap">
            {request.response}
          </div>
        </div>
      )}

      {/* Timeline */}
      {request.events.length > 0 && (
        <div>
          <div className="label-tech mb-2">Timeline</div>
          <RequestTimeline events={request.events} />
        </div>
      )}

      {/* Timestamps */}
      <div className="mt-4 pt-4 border-t border-ink/5 flex gap-6">
        <div>
          <div className="label-tech mb-1">Started</div>
          <div className="font-mono text-2xs text-muted">{formatTime(request.startTime)}</div>
        </div>
        {request.endTime && (
          <div>
            <div className="label-tech mb-1">Completed</div>
            <div className="font-mono text-2xs text-muted">{formatTime(request.endTime)}</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
