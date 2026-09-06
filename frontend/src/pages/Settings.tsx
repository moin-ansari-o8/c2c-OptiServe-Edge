import { PageLayout } from '@/components/PageLayout';
import { SectionHeading } from '@/components/SectionHeading';
import { StatusIndicator } from '@/components/StatusIndicator';
import { useHealth } from '@/hooks/useHealth';
import { DEFAULT_MODEL } from '@/lib/constants';

export function Settings() {
  const health = useHealth();

  return (
    <PageLayout>
      <SectionHeading title="Settings" />

      <div className="max-w-[600px] space-y-10">
        {/* Engine config */}
        <section>
          <div className="font-mono text-xs uppercase tracking-[0.12em] text-ink mb-4">
            Engine
          </div>
          <div className="border border-ink/10 divide-y divide-ink/5">
            <SettingRow label="Model" value={DEFAULT_MODEL} />
            <SettingRow label="Context" value="2048" />
            <SettingRow label="GPU Utilization" value="95%" />
            <SettingRow label="Temperature" value="0.7" />
            <SettingRow label="Streaming" value="ON" />
            <SettingRow
              label="Endpoint"
              value="http://localhost:8000/v1"
              mono
            />
          </div>
        </section>

        {/* Backend status */}
        <section>
          <div className="font-mono text-xs uppercase tracking-[0.12em] text-ink mb-4">
            Backend
          </div>
          <div className="border border-ink/10 divide-y divide-ink/5">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="label-tech">Status</span>
              <StatusIndicator
                status={health.online ? 'online' : 'offline'}
                label={health.online ? 'Online' : 'Offline'}
              />
            </div>
            <SettingRow
              label="Model"
              value={
                health.model
                  ? health.model.split('/').pop() || health.model
                  : health.online
                    ? 'Unknown'
                    : 'Not connected'
              }
            />
            <SettingRow
              label="Engine"
              value={health.engine || (health.online ? 'Unknown' : '—')}
            />
          </div>
        </section>

        {/* Offline warning */}
        {!health.online && !health.checking && (
          <div className="p-4 border border-error/20">
            <div className="font-mono text-xs uppercase tracking-[0.1em] text-error mb-1">
              Engine Offline
            </div>
            <p className="text-sm text-error/70">
              Unable to reach localhost:8000. Ensure the backend is running.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function SettingRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="label-tech">{label}</span>
      <span className={`text-sm text-ink/80 ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}
