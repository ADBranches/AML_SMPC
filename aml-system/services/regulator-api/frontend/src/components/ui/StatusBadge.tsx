type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className="rounded-full border px-3 py-1 text-xs font-semibold">
      {status}
    </span>
  );
}
