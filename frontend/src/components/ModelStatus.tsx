import { StatusIndicator } from './StatusIndicator';

interface ModelStatusProps {
  model: string | null;
  engine: string | null;
  online: boolean;
}

export function ModelStatus({ model, engine, online }: ModelStatusProps) {
  const displayModel = model ? model.split('/').pop() || model : 'Not connected';

  return (
    <div className="flex items-center gap-6">
      <div>
        <div className="label-tech mb-1">Model</div>
        <div className="font-mono text-sm text-ink">{displayModel}</div>
      </div>
      {engine && (
        <div>
          <div className="label-tech mb-1">Engine</div>
          <div className="font-mono text-sm text-ink">{engine}</div>
        </div>
      )}
      <div>
        <div className="label-tech mb-1">Status</div>
        <StatusIndicator
          status={online ? 'online' : 'offline'}
          label={online ? 'Online' : 'Offline'}
        />
      </div>
    </div>
  );
}
