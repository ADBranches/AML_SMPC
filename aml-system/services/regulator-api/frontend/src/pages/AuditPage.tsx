import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { auditApi } from "../api/auditApi";
import { AuditSearchForm } from "../components/audit/AuditSearchForm";
import { AuditTimeline } from "../components/audit/AuditTimeline";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingState } from "../components/ui/LoadingState";
import type { AuditEvent } from "../types/audit";

const defaultTxId = "TX-PHASE73-R16-001";

export function AuditPage() {
  const [txId, setTxId] = useState(defaultTxId);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAuditTimeline() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await auditApi.listByTransaction(txId.trim());
      setEvents(data);
    } catch (err) {
      setEvents([]);
      setError(
        err instanceof Error ? err.message : "Failed to load audit timeline"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Audit Timeline</h2>
        <p className="mt-2 text-slate-600">
          Search a transaction and inspect the compliance workflow timeline.
        </p>
      </div>

      <AuditSearchForm
        txId={txId}
        isLoading={isLoading}
        onTxIdChange={setTxId}
        onSubmit={loadAuditTimeline}
      />

      {error ? <ErrorBanner message={error} /> : null}
      {isLoading ? <LoadingState /> : null}

      <AuditTimeline events={events} />
    </div>
  );
}
