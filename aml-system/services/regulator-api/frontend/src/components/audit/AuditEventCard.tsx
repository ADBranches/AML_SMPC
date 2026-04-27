import type { AuditEvent } from "../../types/audit";
import { StatusBadge } from "../ui/StatusBadge";

type AuditEventCardProps = {
  event: AuditEvent;
  index: number;
};

export function AuditEventCard({ event, index }: AuditEventCardProps) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Step {index + 1}
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {event.event_type}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {event.created_at ?? "timestamp not recorded"}
          </p>
        </div>
        <StatusBadge status={event.event_status} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-slate-500">Event reference</dt>
          <dd className="text-slate-900">{event.event_ref ?? "none"}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Transaction ID</dt>
          <dd className="font-mono text-slate-900">
            {event.tx_id ?? "not recorded"}
          </dd>
        </div>
      </dl>

      {event.details ? (
        <details className="mt-4 rounded-xl bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">
            View event details
          </summary>
          <pre className="mt-3 max-h-64 overflow-auto text-xs text-slate-700">
            {JSON.stringify(event.details, null, 2)}
          </pre>
        </details>
      ) : null}
    </article>
  );
}
