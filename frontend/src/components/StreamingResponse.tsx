import { useRef, useEffect } from 'react';
import type { RequestStatus } from '@/types/telemetry';

interface StreamingResponseProps {
  response: string;
  status: RequestStatus;
  error: string | null;
}

export function StreamingResponse({ response, status, error }: StreamingResponseProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [response]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="label-tech">Live Response</div>
        {status !== 'idle' && (
          <span className={`
            font-mono text-2xs uppercase tracking-[0.1em] px-2 py-0.5 border
            ${status === 'generating' ? 'text-ink border-accent/40 bg-accent/10' : ''}
            ${status === 'complete' ? 'text-muted border-ink/10' : ''}
            ${status === 'error' ? 'text-error border-error/30' : ''}
            ${status === 'connecting' || status === 'scheduling' ? 'text-muted border-ink/15' : ''}
          `}>
            {status}
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 border border-ink/10 bg-cream-dark/20"
      >
        {error ? (
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-[0.1em] text-error">
              {status === 'error' ? 'Stream interrupted' : 'Error'}
            </div>
            <div className="font-mono text-xs text-error/80">{error}</div>
          </div>
        ) : response ? (
          <div className="text-sm leading-relaxed text-ink/90 whitespace-pre-wrap">
            {response}
            {status === 'generating' && (
              <span className="inline-block w-[2px] h-4 bg-ink/60 ml-0.5 animate-pulse align-middle" />
            )}
          </div>
        ) : status === 'idle' ? (
          <div className="text-sm text-muted/60 italic">
            Response will appear here...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted uppercase tracking-wider">
              {status === 'connecting' ? 'Connecting...' : 'Waiting...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
