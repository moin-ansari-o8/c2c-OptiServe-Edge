import { motion } from 'framer-motion';

interface MetricProps {
  value: string | number;
  label: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function Metric({ value, label, unit, size = 'md', animate = true }: MetricProps) {
  const valueClass = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }[size];

  const content = (
    <div className="space-y-1">
      <div className={`mono-data font-light ${valueClass} text-ink`}>
        {value}
        {unit && <span className="text-muted ml-1 text-xs">{unit}</span>}
      </div>
      <div className="label-tech">{label}</div>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {content}
    </motion.div>
  );
}
