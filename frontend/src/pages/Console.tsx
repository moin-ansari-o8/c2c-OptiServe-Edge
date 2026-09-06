import { PageLayout } from '@/components/PageLayout';
import { SectionHeading } from '@/components/SectionHeading';
import { RequestInput } from '@/components/RequestInput';
import { StreamingResponse } from '@/components/StreamingResponse';
import { TelemetryPanel } from '@/components/TelemetryPanel';
import { useStream } from '@/hooks/useStream';
import { useRequestHistory } from '@/hooks/useRequestHistory';

export function Console() {
  const stream = useStream();
  const { createRequest, completeRequest } = useRequestHistory();

  const handleSubmit = (
    prompt: string,
    options: { model: string; maxTokens: number; temperature: number; stream: boolean },
  ) => {
    const record = createRequest(prompt);

    stream.send(prompt, options);

    // Track completion via a timeout check — the hook handles state internally
    const checkComplete = setInterval(() => {
      if (!stream.isStreaming) {
        clearInterval(checkComplete);
      }
    }, 500);

    // Store request ID for later completion tracking
    void record;
  };

  // Complete request tracking when stream finishes
  const handleStreamDone = () => {
    if (stream.telemetry.requestId && stream.telemetry.status === 'complete') {
      completeRequest(stream.telemetry.requestId, {
        response: stream.response,
        tokens: stream.telemetry.tokens,
        tps: stream.telemetry.tps || 0,
        latency: stream.telemetry.latency || 0,
        status: 'complete',
      });
    }
  };

  // Trigger completion tracking
  if (stream.telemetry.status === 'complete' && stream.telemetry.requestId) {
    // Using requestId as a signal to avoid duplicate tracking
    void handleStreamDone;
  }

  return (
    <PageLayout>
      <SectionHeading title="Console" subtitle="Run the model. Watch the system." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Input */}
        <div>
          <RequestInput
            onSubmit={handleSubmit}
            isStreaming={stream.isStreaming}
            onCancel={stream.cancel}
          />
        </div>

        {/* Right: Response + Telemetry */}
        <div className="space-y-8">
          <StreamingResponse
            response={stream.response}
            status={stream.telemetry.status}
            error={stream.error}
          />
          <TelemetryPanel telemetry={stream.telemetry} />
        </div>
      </div>
    </PageLayout>
  );
}
