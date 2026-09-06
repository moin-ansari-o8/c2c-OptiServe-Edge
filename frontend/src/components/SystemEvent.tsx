import { formatTime } from '@/lib/format';
import { motion } from 'framer-motion';

interface SystemEventProps {
  timestamp: number;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
}

export function SystemEvent({ timestamp, message, type = 'info' }: SystemEventProps) {
  const dotColor = {
    info: 'bg-ink/30',
    success: 'bg-accent',
    error: 'bg-error',
    warning: 'bg-amber-500',
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 py-2"
    >
      <span className="font-mono text-2xs text-muted tabular-nums whitespace-nowrap pt-0.5">
        {formatTime(timestamp)}
      </span>
      <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
      <span className="font-mono text-xs text-ink/80">{message}</span>
    </motion.div>
  );
}
