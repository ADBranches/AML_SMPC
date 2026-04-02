import clsx from 'clsx';

export default function StatusBadge({ value }) {
  const normalized = String(value || '').toLowerCase();

  const color = clsx(
    'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
    normalized === 'verified' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    normalized === 'generated' && 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    normalized === 'failed' && 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    !['verified', 'generated', 'failed'].includes(normalized) &&
      'border-slate-700 bg-slate-800 text-slate-300'
  );

  return <span className={color}>{value || 'unknown'}</span>;
}