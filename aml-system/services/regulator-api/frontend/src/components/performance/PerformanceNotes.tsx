import { Card } from "../ui/Card";

export function PerformanceNotes() {
  return (
    <Card>
      <h3 className="font-bold text-slate-950">Performance Interpretation</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        The transaction benchmark demonstrates sustained throughput above the 1000 transactions in 5 seconds equivalent target.
        The proof-generation benchmark demonstrates controlled proof latency below the 100 ms P95 target.
      </p>
    </Card>
  );
}
