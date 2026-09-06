import { AgentNode } from './AgentNode';
import { motion } from 'framer-motion';
import type { Agent } from '@/types/agent';

interface AgentFlowProps {
  agents: Agent[];
  className?: string;
}

export function AgentFlow({ agents, className = '' }: AgentFlowProps) {
  const planner = agents.find((a) => a.role === 'planner');
  const coder = agents.find((a) => a.role === 'coder');
  const debugger_ = agents.find((a) => a.role === 'debugger');
  const reviewer = agents.find((a) => a.role === 'reviewer');

  return (
    <div className={`flex flex-col items-center gap-0 ${className}`}>
      {/* User input */}
      <div className="px-4 py-2 border border-ink/15 bg-cream font-mono text-2xs uppercase tracking-[0.12em] text-ink/60">
        User
      </div>
      <div className="w-px h-6 bg-ink/10" />

      {/* Planner */}
      {planner && <AgentNode label={planner.label} status={planner.status} tokens={planner.tokens} />}
      <div className="w-px h-6 bg-ink/10" />

      {/* Coder + Debugger side by side */}
      <div className="flex items-start gap-8">
        {coder && <AgentNode label={coder.label} status={coder.status} tokens={coder.tokens} />}

        {/* Connector */}
        <div className="flex flex-col items-center justify-center h-full pt-4">
          <svg width="40" height="2" className="text-ink/10">
            <line x1="0" y1="1" x2="40" y2="1" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
          </svg>
        </div>

        {debugger_ && <AgentNode label={debugger_.label} status={debugger_.status} tokens={debugger_.tokens} />}
      </div>

      {/* Connector lines merging */}
      <svg width="200" height="24" className="text-ink/10">
        <line x1="60" y1="0" x2="100" y2="24" stroke="currentColor" strokeWidth="1" />
        <line x1="140" y1="0" x2="100" y2="24" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Reviewer */}
      {reviewer && <AgentNode label={reviewer.label} status={reviewer.status} tokens={reviewer.tokens} />}

      {/* Completion indicator */}
      {reviewer?.status === 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 font-mono text-2xs uppercase tracking-[0.12em] text-accent"
        >
          Pipeline Complete
        </motion.div>
      )}
    </div>
  );
}
