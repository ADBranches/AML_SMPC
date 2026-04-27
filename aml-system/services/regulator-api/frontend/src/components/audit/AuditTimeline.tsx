import type { AuditEvent } from "../../types/audit";
import { AuditEventCard } from "./AuditEventCard";

type AuditTimelineProps = {
  events: AuditEvent[];
};

export function AuditTimeline({ events }: AuditTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
        No audit events loaded yet. Search by transaction ID to begin.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <AuditEventCard
          key={event.id ?? `${event.event_type}-${index}`}
          event={event}
          index={index}
        />
      ))}
    </div>
  );
}
