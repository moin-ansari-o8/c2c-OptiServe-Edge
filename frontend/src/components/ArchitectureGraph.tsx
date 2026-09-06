import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ArchNode {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
}

interface ArchEdge {
  from: string;
  to: string;
}

const NODES: ArchNode[] = [
  { id: 'a1', label: 'AGENT 1', description: 'Individual inference request from an AI agent.', x: 120, y: 40 },
  { id: 'a2', label: 'AGENT 2', description: 'Concurrent request from a second agent.', x: 280, y: 40 },
  { id: 'a3', label: 'AGENT 3', description: 'Third concurrent agent request.', x: 440, y: 40 },
  {
    id: 'scheduler',
    label: 'SCHEDULER',
    description: 'Routes incoming requests to the inference pipeline. Handles queueing and priority.',
    x: 280,
    y: 130,
  },
  {
    id: 'cache',
    label: 'PREFIX CACHE',
    description:
      'Caches KV-cache states for shared prompt prefixes. When multiple agents share a system prompt or conversation prefix, computation is reused instead of repeated.',
    x: 280,
    y: 220,
  },
  {
    id: 'batch',
    label: 'CONTINUOUS BATCH',
    description:
      'Requests are dynamically inserted into the active generation batch instead of waiting for an entire batch to finish. This eliminates head-of-line blocking and maximizes GPU utilization.',
    x: 280,
    y: 310,
  },
  {
    id: 'model',
    label: 'QWEN 1.5B',
    description: 'Qwen2.5-1.5B-Instruct running with INT4/AWQ quantization. Reduces memory from ~3GB to ~1GB, making multi-agent workloads feasible on consumer GPUs.',
    x: 280,
    y: 400,
  },
  {
    id: 'gpu',
    label: 'GPU',
    description: 'Consumer GPU with constrained VRAM. INT4 quantization and memory optimization ensure stable operation under concurrent load.',
    x: 280,
    y: 490,
  },
];

const EDGES: ArchEdge[] = [
  { from: 'a1', to: 'scheduler' },
  { from: 'a2', to: 'scheduler' },
  { from: 'a3', to: 'scheduler' },
  { from: 'scheduler', to: 'cache' },
  { from: 'cache', to: 'batch' },
  { from: 'batch', to: 'model' },
  { from: 'model', to: 'gpu' },
];

function getNodeCenter(node: ArchNode): { cx: number; cy: number } {
  return { cx: node.x, cy: node.y };
}

export function ArchitectureGraph({ className = '' }: { className?: string }) {
  const [selected, setSelected] = useState<ArchNode | null>(null);

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 560 540"
        className="w-full max-w-[560px] mx-auto"
        aria-label="Architecture diagram"
      >
        {/* Edges */}
        {EDGES.map((edge) => {
          const from = NODES.find((n) => n.id === edge.from)!;
          const to = NODES.find((n) => n.id === edge.to)!;
          const fromC = getNodeCenter(from);
          const toC = getNodeCenter(to);
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={fromC.cx}
              y1={fromC.cy + 16}
              x2={toC.cx}
              y2={toC.cy - 16}
              stroke="#10101015"
              strokeWidth="1"
            />
          );
        })}

        {/* Animated dots on edges */}
        {EDGES.map((edge, i) => {
          const from = NODES.find((n) => n.id === edge.from)!;
          const to = NODES.find((n) => n.id === edge.to)!;
          const fromC = getNodeCenter(from);
          const toC = getNodeCenter(to);
          return (
            <motion.circle
              key={`dot-${edge.from}-${edge.to}`}
              r="2.5"
              fill="#BEEB59"
              opacity={0.7}
              animate={{
                cx: [fromC.cx, toC.cx],
                cy: [fromC.cy + 16, toC.cy - 16],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 2,
                ease: 'easeInOut',
              }}
            />
          );
        })}

        {/* Nodes */}
        {NODES.map((node) => (
          <g key={node.id}>
            <motion.rect
              x={node.x - 60}
              y={node.y - 14}
              width={120}
              height={28}
              fill="#F6F4E8"
              stroke={selected?.id === node.id ? '#101010' : '#10101020'}
              strokeWidth={selected?.id === node.id ? 1.5 : 1}
              className="cursor-pointer"
              whileHover={{ stroke: '#10101050' }}
              onClick={() => setSelected(selected?.id === node.id ? null : node)}
            />
            <text
              x={node.x}
              y={node.y + 3}
              textAnchor="middle"
              className="font-mono text-[9px] uppercase tracking-[0.1em] fill-ink/70 pointer-events-none select-none"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mt-6 p-4 border border-ink/10"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink">
                {selected.label}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="font-mono text-2xs text-muted hover:text-ink transition-colors"
                aria-label="Close detail"
              >
                Close
              </button>
            </div>
            <p className="text-sm text-ink/70 leading-relaxed">
              {selected.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
