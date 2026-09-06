import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PageLayout } from '@/components/PageLayout';
import { SectionHeading } from '@/components/SectionHeading';
import { RequestTable } from '@/components/RequestTable';
import { RequestDetail } from '@/components/RequestDetail';
import { useRequestHistory } from '@/hooks/useRequestHistory';
import type { RequestRecord } from '@/types/telemetry';

export function Requests() {
  const { requests, clearHistory } = useRequestHistory();
  const [selected, setSelected] = useState<RequestRecord | null>(null);

  return (
    <PageLayout>
      <div className="flex items-start justify-between mb-8">
        <SectionHeading title="Requests" subtitle="Request history" className="mb-0" />
        {requests.length > 0 && (
          <button onClick={clearHistory} className="btn-secondary text-2xs">
            Clear History
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          <RequestDetail
            key="detail"
            request={selected}
            onClose={() => setSelected(null)}
          />
        ) : (
          <RequestTable
            key="table"
            requests={requests}
            onSelect={setSelected}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
