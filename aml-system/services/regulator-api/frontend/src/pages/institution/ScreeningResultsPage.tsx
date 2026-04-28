import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { auditApi } from "../../api/auditApi";
import { AuditTimeline } from "../../components/audit/AuditTimeline";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { AuditEvent } from "../../types/audit";

export function ScreeningResultsPage() {
  const [searchParams] = useSearchParams();
  const initialTxId = searchParams.get("tx_id") ?? "TX-UI-DEMO-001";
  const [txId, setTxId] = useState(initialTxId);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const screeningEvents = events.filter((event) =>
    event.event_type.toLowerCase().includes("screening")
  );

  async function load() {
    setLoading(true);
    setError("");

    try {
      const data = await auditApi.listByTransaction(txId);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load screening results");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="SMPC Screening Results"
        description="Live screening evidence pulled from the audit trail for a selected transaction."
      />

      <Card>
        <label className="text-sm font-semibold text-slate-700">Transaction ID</label>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <input
            value={txId}
            onChange={(event) => setTxId(event.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          />
          <button
            onClick={load}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Load Screening Evidence
          </button>
        </div>
      </Card>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <section className="grid gap-4 lg:grid-cols-2">
        {screeningEvents.map((event) => (
          <Card key={event.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{event.event_type}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Event ref: {event.event_ref ?? "N/A"}
                </p>
              </div>
              <StatusBadge status={event.event_status} />
            </div>
          </Card>
        ))}

        {!loading && events.length > 0 && screeningEvents.length === 0 ? (
          <Card>
            <h3 className="font-bold">No screening events found</h3>
            <p className="mt-2 text-sm text-slate-600">
              Audit exists, but no SMPC screening event was recorded for this transaction.
            </p>
          </Card>
        ) : null}
      </section>

      <AuditTimeline events={events} />
    </div>
  );
}
