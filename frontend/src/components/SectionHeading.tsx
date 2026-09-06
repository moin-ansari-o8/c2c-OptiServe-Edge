interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({ title, subtitle, className = '' }: SectionHeadingProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-baseline gap-4">
        <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-ink">
          {title}
        </h2>
        {subtitle && (
          <span className="font-mono text-2xs text-muted">
            {subtitle}
          </span>
        )}
      </div>
      <div className="mt-3 h-px bg-ink/10" />
    </div>
  );
}
