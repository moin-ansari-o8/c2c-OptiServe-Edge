import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const PIPELINE_STAGES = [
  { id: 'requests', label: 'REQUESTS' },
  { id: 'scheduler', label: 'SCHEDULER' },
  { id: 'cache', label: 'PREFIX CACHE' },
  { id: 'batch', label: 'CONTINUOUS BATCH' },
  { id: 'model', label: 'QWEN' },
  { id: 'gpu', label: 'GPU' },
];

interface RequestPacket {
  id: number;
  stage: number;
  offset: number;
}

export function RequestPipeline({ className = '' }: { className?: string }) {
  const [packets, setPackets] = useState<RequestPacket[]>([]);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      setPackets((prev) => [
        ...prev.filter((p) => p.stage < PIPELINE_STAGES.length),
        { id: Date.now(), stage: 0, offset: Math.random() * 20 - 10 },
      ]);
    }, 1800);

    const moveInterval = setInterval(() => {
      setPackets((prev) =>
        prev
          .map((p) => ({ ...p, stage: p.stage + 1 }))
          .filter((p) => p.stage <= PIPELINE_STAGES.length),
      );
    }, 600);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Pipeline stages */}
      <div className="flex flex-col items-center gap-0">
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={stage.id} className="flex flex-col items-center">
            {/* Stage node */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative z-10 px-4 py-2 border border-ink/15 bg-cream min-w-[160px] text-center"
            >
              <span className="font-mono text-2xs uppercase tracking-[0.12em] text-ink/70">
                {stage.label}
              </span>

              {/* Request packets at this stage */}
              {packets
                .filter((p) => p.stage === i)
                .map((packet) => (
                  <motion.div
                    key={packet.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent"
                    style={{ right: -8 + packet.offset * 0.3 }}
                  />
                ))}
            </motion.div>

            {/* Connector line */}
            {i < PIPELINE_STAGES.length - 1 && (
              <div className="w-px h-6 bg-ink/10 relative">
                {/* Animated dot traveling down */}
                {packets.some((p) => p.stage === i) && (
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Signature flow line at the bottom */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="font-mono text-2xs text-muted">REQUEST</span>
        <svg width="120" height="2" className="overflow-visible">
          <line x1="0" y1="1" x2="120" y2="1" stroke="currentColor" strokeWidth="1" className="text-ink/15" />
          <motion.circle
            cx="0"
            cy="1"
            r="3"
            fill="#BEEB59"
            animate={{ cx: [0, 120] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
        <span className="font-mono text-2xs text-muted">ENGINE</span>
      </div>
    </div>
  );
}
