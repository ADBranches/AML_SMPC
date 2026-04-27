import type { AuditEvent } from "../../types/audit";
import { EmptyState } from "../ui/EmptyState";
import { AuditEventCard } from "./AuditEventCard";

type AuditTimelineProps = {
  events: AuditEvent[];
};

export function AuditTimeline({ events }: AuditTimelineProps) {
  if (events.length === 0) {
    return <EmptyState message="No audit events loaded yet. Search by transaction ID to begin." />;
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <AuditEventCard key={event.id ?? `${event.event_type}-${index}`} event={event} index={index} />
      ))}
    </div>
  );
}
