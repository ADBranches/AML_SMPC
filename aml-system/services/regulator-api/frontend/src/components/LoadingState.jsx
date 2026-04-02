export default function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
        <span>{label}</span>
      </div>
    </div>
  );
}