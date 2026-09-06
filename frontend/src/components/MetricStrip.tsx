import { Metric } from './Metric';

interface MetricItem {
  value: string | number;
  label: string;
  unit?: string;
}

interface MetricStripProps {
  metrics: MetricItem[];
  size?: 'sm' | 'md' | 'lg';
}

export function MetricStrip({ metrics, size = 'md' }: MetricStripProps) {
  return (
    <div className="flex flex-wrap gap-8 lg:gap-12">
      {metrics.map((metric, i) => (
        <div key={i} className="flex items-start gap-8">
          <Metric
            value={metric.value}
            label={metric.label}
            unit={metric.unit}
            size={size}
          />
          {i < metrics.length - 1 && (
            <div className="hidden lg:block w-px h-12 bg-ink/10 self-center" />
          )}
        </div>
      ))}
    </div>
  );
}
