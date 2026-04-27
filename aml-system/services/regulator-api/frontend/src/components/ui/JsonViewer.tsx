type JsonViewerProps = {
  value: unknown;
  title?: string;
};

export function JsonViewer({ value, title }: JsonViewerProps) {
  return (
    <div className="rounded-2xl border bg-slate-950 p-4 text-slate-100">
      {title ? <div className="mb-3 text-sm font-semibold text-slate-300">{title}</div> : null}
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
