export type AuditEvent = {
  id?: string;
  tx_id?: string;
  event_type: string;
  event_status: string;
  event_ref?: string | null;
  details?: Record<string, unknown>;
  created_at?: string;
};
