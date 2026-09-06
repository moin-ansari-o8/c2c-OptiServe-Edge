interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'generating' | 'error';
  label?: string;
  className?: string;
}

export function StatusIndicator({ status, label, className = '' }: StatusIndicatorProps) {
  const dotClass = {
    online: 'bg-accent',
    offline: 'bg-ink/20',
    generating: 'bg-accent animate-pulse',
    error: 'bg-error',
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {label && (
        <span className="font-mono text-2xs uppercase tracking-[0.1em]">
          {label}
        </span>
      )}
    </span>
  );
}
