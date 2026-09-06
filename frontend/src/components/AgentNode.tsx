import { motion } from 'framer-motion';
import type { AgentStatus } from '@/types/agent';

interface AgentNodeProps {
  label: string;
  status: AgentStatus;
  tokens?: number;
  className?: string;
}

const STATUS_CONFIG: Record<AgentStatus, { color: string; text: string }> = {
  idle: { color: 'border-ink/10 bg-cream', text: 'text-muted' },
  queued: { color: 'border-ink/20 bg-cream-dark/30', text: 'text-ink/50' },
  running: { color: 'border-accent/50 bg-accent/5', text: 'text-ink' },
  waiting: { color: 'border-ink/15 bg-cream', text: 'text-muted' },
  complete: { color: 'border-ink/20 bg-cream', text: 'text-ink/70' },
  error: { color: 'border-error/40 bg-error/5', text: 'text-error' },
};

export function AgentNode({ label, status, tokens, className = '' }: AgentNodeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <motion.div
      layout
      className={`border p-4 min-w-[140px] text-center ${config.color} ${className}`}
      animate={status === 'running' ? { borderColor: ['#BEEB5980', '#BEEB59', '#BEEB5980'] } : {}}
      transition={status === 'running' ? { duration: 2, repeat: Infinity } : {}}
    >
      <div className="font-mono text-xs uppercase tracking-[0.12em] text-ink mb-1">
        {label}
      </div>
      <div className={`font-mono text-2xs uppercase tracking-[0.1em] ${config.text}`}>
        {status}
      </div>
      {tokens !== undefined && tokens > 0 && (
        <div className="mt-1 font-mono text-2xs text-muted">
          {tokens} tok
        </div>
      )}
    </motion.div>
  );
}
