import { useState } from 'react';
import { DEFAULT_MODEL, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '@/lib/constants';

interface RequestInputProps {
  onSubmit: (prompt: string, options: { model: string; maxTokens: number; temperature: number; stream: boolean }) => void;
  isStreaming: boolean;
  onCancel: () => void;
}

export function RequestInput({ onSubmit, isStreaming, onCancel }: RequestInputProps) {
  const [prompt, setPrompt] = useState('');
  const [maxTokens, setMaxTokens] = useState(DEFAULT_MAX_TOKENS);
  const [temperature, setTemperature] = useState(DEFAULT_TEMPERATURE);
  const [streaming, setStreaming] = useState(true);

  const handleSubmit = () => {
    if (!prompt.trim() || isStreaming) return;
    onSubmit(prompt.trim(), {
      model: DEFAULT_MODEL,
      maxTokens,
      temperature,
      stream: streaming,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="label-tech">Request</div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask the local model anything..."
        className="textarea-field h-32"
        disabled={isStreaming}
        aria-label="Prompt input"
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <div className="label-tech mb-1">Model</div>
          <div className="font-mono text-xs text-ink/70">Qwen 1.5B</div>
        </div>

        <div>
          <div className="label-tech mb-1">Max tokens</div>
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            className="input-field w-20 text-xs"
            min={1}
            max={2048}
            disabled={isStreaming}
            aria-label="Max tokens"
          />
        </div>

        <div>
          <div className="label-tech mb-1">Temperature</div>
          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="input-field w-16 text-xs"
            min={0}
            max={2}
            step={0.1}
            disabled={isStreaming}
            aria-label="Temperature"
          />
        </div>

        <div>
          <div className="label-tech mb-1">Streaming</div>
          <button
            onClick={() => setStreaming(!streaming)}
            className={`
              font-mono text-2xs uppercase tracking-[0.1em]
              px-3 py-1 border transition-colors duration-200
              ${streaming
                ? 'bg-ink text-cream border-ink'
                : 'bg-transparent text-ink/60 border-ink/15'}
            `}
            disabled={isStreaming}
            aria-label={`Streaming ${streaming ? 'on' : 'off'}`}
          >
            {streaming ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {isStreaming ? (
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Run
          </button>
        )}
      </div>
    </div>
  );
}
