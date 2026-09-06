import type { RequestEvent } from '@/types/telemetry';
import { formatTime } from '@/lib/format';
import { motion } from 'framer-motion';

interface RequestTimelineProps {
  events: RequestEvent[];
  className?: string;
}

export function RequestTimeline({ events, className = '' }: RequestTimelineProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Vertical line */}
      <div className="absolute left-[5px] top-2 bottom-2 w-px bg-ink/10" />

      <div className="space-y-0">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 py-1.5 pl-0"
          >
            {/* Dot */}
            <span
              className={`relative z-10 w-[10px] h-[10px] rounded-full border shrink-0 mt-0.5 ${
                event.type === 'complete'
                  ? 'bg-accent border-accent'
                  : event.type === 'error'
                    ? 'bg-error border-error'
                    : 'bg-cream border-ink/20'
              }`}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs text-ink/80">{event.message}</div>
              <div className="font-mono text-2xs text-muted mt-0.5">
                {formatTime(event.timestamp)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
