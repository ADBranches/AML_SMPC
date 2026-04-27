type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  const style =
    normalized.includes("pass") ||
    normalized.includes("verified") ||
    normalized.includes("ok") ||
    normalized.includes("success") ||
    normalized.includes("no_match")
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : normalized.includes("review") || normalized.includes("pending")
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${style}`}>
      {status.replaceAll("_", " ").toUpperCase()}
    </span>
  );
}
