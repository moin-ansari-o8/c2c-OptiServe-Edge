import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageLayout } from '@/components/PageLayout';
import { RequestPipeline } from '@/components/RequestPipeline';
import { ROUTES } from '@/lib/constants';

const TECH_SECTIONS = [
  {
    id: 'int4',
    label: 'INT4 PINNING',
    description:
      'AWQ-style 4-bit quantization reduces model memory from ~3GB to ~1GB. Weights are pinned in GPU memory, enabling stable multi-agent workloads on consumer hardware.',
  },
  {
    id: 'cache',
    label: 'PREFIX CACHE',
    description:
      'Shared prompt prefixes between agents are computed once and cached. Repeated system prompts and conversation history bypass redundant computation.',
  },
  {
    id: 'batch',
    label: 'CONTINUOUS BATCHING',
    description:
      'New requests join the generation loop mid-batch instead of waiting. This eliminates head-of-line blocking and keeps the GPU busy across concurrent agents.',
  },
];

export function Home() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="pt-8 pb-20 lg:pt-16 lg:pb-32">
        <div className="max-w-[800px]">
          {/* Micro label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="label-tech mb-6"
          >
            Local inference optimization
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-display-sm lg:text-display leading-none mb-8"
          >
            <span className="font-sans font-light tracking-tight">LOCAL INFERENCE,</span>
            <br />
            <span className="heading-editorial">UNDER PRESSURE.</span>
          </motion.h1>

          {/* Supporting copy */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base lg:text-lg text-ink/60 max-w-[520px] leading-relaxed mb-10"
          >
            Run multi-agent AI locally without letting constrained hardware become the bottleneck.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap gap-3"
          >
            <Link to={ROUTES.console} className="btn-primary">
              Open Console
            </Link>
            <Link to={ROUTES.architecture} className="btn-secondary">
              View Architecture
            </Link>
          </motion.div>
        </div>

        {/* Signature flow line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 flex items-center gap-3"
        >
          <span className="font-mono text-2xs text-muted/50">REQUESTS</span>
          <svg width="200" height="2" className="overflow-visible flex-shrink-0">
            <line x1="0" y1="1" x2="200" y2="1" stroke="currentColor" strokeWidth="1" className="text-ink/8" />
            <motion.circle
              cx="0" cy="1" r="3" fill="#BEEB59" opacity={0.6}
              animate={{ cx: [0, 200] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <motion.circle
              cx="0" cy="1" r="2" fill="#BEEB59" opacity={0.4}
              animate={{ cx: [0, 200] }}
              transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </svg>
          <span className="font-mono text-2xs text-muted/50">ENGINE</span>
        </motion.div>
      </section>

      {/* Technical sections */}
      <section className="pb-20">
        <div className="h-px bg-ink/10 mb-12" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {TECH_SECTIONS.map((section, i) => (
            <motion.article
              key={section.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              className={`py-6 lg:py-0 lg:px-8 ${
                i < TECH_SECTIONS.length - 1 ? 'border-b lg:border-b-0 lg:border-r border-ink/10' : ''
              } ${i === 0 ? 'lg:pl-0' : ''} ${i === TECH_SECTIONS.length - 1 ? 'lg:pr-0' : ''}`}
            >
              <div className="font-mono text-xs uppercase tracking-[0.12em] text-ink mb-3">
                {section.label}
              </div>
              <p className="text-sm text-ink/50 leading-relaxed">
                {section.description}
              </p>
            </motion.article>
          ))}
        </div>

        <div className="h-px bg-ink/10 mt-12" />
      </section>

      {/* Pipeline visualization */}
      <section className="pb-20">
        <div className="flex items-baseline gap-4 mb-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-ink">
            Request Pipeline
          </h2>
          <span className="font-mono text-2xs text-muted">Live visualization</span>
        </div>

        <div className="flex justify-center">
          <RequestPipeline />
        </div>
      </section>

      {/* Bottom tagline */}
      <section className="pb-16 pt-8">
        <div className="h-px bg-ink/10 mb-12" />
        <div className="text-center space-y-1">
          <div className="font-mono text-2xs uppercase tracking-[0.15em] text-muted/50">
            No cloud. No magic. Just inference.
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
