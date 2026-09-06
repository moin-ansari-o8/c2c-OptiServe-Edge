interface TechnicalLabelProps {
  text: string;
  variant?: 'default' | 'accent' | 'muted';
  className?: string;
}

export function TechnicalLabel({ text, variant = 'default', className = '' }: TechnicalLabelProps) {
  const colorClass = {
    default: 'text-ink/70 border-ink/15',
    accent: 'text-ink bg-accent/20 border-accent/30',
    muted: 'text-muted border-ink/10',
  }[variant];

  return (
    <span
      className={`
        inline-block px-2 py-0.5
        font-mono text-2xs uppercase tracking-[0.1em]
        border ${colorClass}
        ${className}
      `}
    >
      {text}
    </span>
  );
}
