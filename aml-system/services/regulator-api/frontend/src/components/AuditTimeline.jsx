import { format } from 'date-fns';

function formatDate(value) {
  try {
    return format(new Date(value), 'yyyy-MM-dd HH:mm:ss');
  } catch {
    return value || 'unknown';
  }
}

export default function AuditTimeline({ items = [] }) {
  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Audit timeline
        </h3>
        <p className="mt-4 text-sm text-slate-400">No audit events available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Audit timeline
      </h3>

      <div className="mt-4 space-y-4">
        {safeItems.map((item, index) => (
          <div key={item?.key ?? item?.id ?? `audit-${index}`} className="flex gap-4">
            <div className="mt-1 h-3 w-3 rounded-full bg-sky-400" />

            <div className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-slate-100">
                    {item?.eventType ?? item?.event_type ?? 'event'}
                  </p>
                  <p className="text-xs text-slate-400">
                    status: {item?.eventStatus ?? item?.event_status ?? 'unknown'}
                  </p>
                </div>

                <div className="text-xs text-slate-500">
                  {formatDate(item?.createdAt ?? item?.created_at)}
                </div>
              </div>

              {(item?.eventRef ?? item?.event_ref) ? (
                <p className="mt-3 text-xs text-slate-400">
                  event_ref: {item?.eventRef ?? item?.event_ref}
                </p>
              ) : null}

              <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-3 text-xs text-slate-300">
{JSON.stringify(item?.details ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}