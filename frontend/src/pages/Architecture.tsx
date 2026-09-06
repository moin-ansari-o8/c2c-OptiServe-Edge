import { PageLayout } from '@/components/PageLayout';
import { SectionHeading } from '@/components/SectionHeading';
import { ArchitectureGraph } from '@/components/ArchitectureGraph';
import { motion } from 'framer-motion';

export function Architecture() {
  return (
    <PageLayout>
      <SectionHeading title="Architecture" subtitle="Click any node for details." />

      <div className="max-w-[700px] mx-auto">
        <ArchitectureGraph />
      </div>

      {/* Optimization overview */}
      <div className="mt-16 pt-12 border-t border-ink/10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {[
            {
              title: 'Memory',
              detail: 'INT4/AWQ',
              description: '4-bit weight quantization reduces VRAM footprint by ~75%. The model runs comfortably in constrained GPU memory.',
            },
            {
              title: 'Compute',
              detail: 'Prefix Cache',
              description: 'KV-cache reuse eliminates redundant computation when agents share prompt prefixes.',
            },
            {
              title: 'Throughput',
              detail: 'Continuous Batch',
              description: 'Dynamic request insertion keeps the GPU saturated. No request waits for a batch boundary.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`py-6 lg:py-0 lg:px-8 ${
                i < 2 ? 'border-b lg:border-b-0 lg:border-r border-ink/10' : ''
              } ${i === 0 ? 'lg:pl-0' : ''} ${i === 2 ? 'lg:pr-0' : ''}`}
            >
              <div className="font-mono text-2xs uppercase tracking-[0.12em] text-muted mb-1">
                {item.title}
              </div>
              <div className="font-mono text-xs uppercase tracking-[0.1em] text-ink mb-2">
                {item.detail}
              </div>
              <p className="text-sm text-ink/50 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom signature */}
      <div className="mt-16 flex items-center justify-center gap-3">
        <span className="font-mono text-2xs text-muted/40">REQUESTS</span>
        <svg width="160" height="2" className="overflow-visible">
          <line x1="0" y1="1" x2="160" y2="1" stroke="currentColor" strokeWidth="1" className="text-ink/8" />
          <motion.circle
            cx="0" cy="1" r="2.5" fill="#BEEB59" opacity={0.5}
            animate={{ cx: [0, 160] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />
        </svg>
        <span className="font-mono text-2xs text-muted/40">ENGINE</span>
      </div>
    </PageLayout>
  );
}
