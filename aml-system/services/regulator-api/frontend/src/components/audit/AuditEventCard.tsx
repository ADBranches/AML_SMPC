import type { AuditEvent } from "../../types/audit";
import { formatDate } from "../../utils/formatDate";
import { Card } from "../ui/Card";
import { JsonViewer } from "../ui/JsonViewer";
import { StatusBadge } from "../ui/StatusBadge";

type AuditEventCardProps = {
  event: AuditEvent;
  index: number;
};

export function AuditEventCard({ event, index }: AuditEventCardProps) {
  return (
    <Card>
      <div className="flex gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
          {index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-950">{event.event_type}</h3>
              <p className="mt-1 text-xs text-slate-500">{formatDate(event.created_at)}</p>
            </div>
            <StatusBadge status={event.event_status} />
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Event ref: <span className="font-mono">{event.event_ref ?? "N/A"}</span>
          </p>

          <div className="mt-4">
            <JsonViewer value={event.details ?? {}} />
          </div>
        </div>
      </div>
    </Card>
  );
}
