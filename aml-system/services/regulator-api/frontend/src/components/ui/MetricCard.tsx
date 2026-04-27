type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <h3 className="mt-2 text-3xl font-bold text-slate-950">{value}</h3>
      {helper ? <p className="mt-2 text-sm text-slate-600">{helper}</p> : null}
    </article>
  );
}
