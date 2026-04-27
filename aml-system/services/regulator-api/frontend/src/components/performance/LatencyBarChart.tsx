const bars = [
  { label: "Median", value: 46 },
  { label: "P95", value: 58 },
  { label: "P99", value: 66 },
];

export function LatencyBarChart() {
  const max = Math.max(...bars.map((bar) => bar.value));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-bold text-slate-950">Proof Latency Percentiles</h3>
      <div className="mt-5 space-y-4">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-slate-700">{bar.label}</span>
              <span className="font-mono text-slate-600">{bar.value} ms</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-950"
                style={{ width: `${(bar.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
