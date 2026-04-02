export default function ErrorState({ title = 'Something went wrong', detail }) {
  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-200">
      <h2 className="text-base font-semibold">{title}</h2>
      {detail ? <pre className="mt-3 overflow-auto whitespace-pre-wrap text-xs text-rose-100">{detail}</pre> : null}
    </div>
  );
}