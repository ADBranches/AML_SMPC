import { MetricCard } from "../ui/MetricCard";

export function PerformanceMetricGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Transaction Requests" value="10,091" helper="Phase 7.2 transaction load evidence." />
      <MetricCard label="Transaction Failures" value="0" helper="No failed transaction submissions in benchmark." />
      <MetricCard label="Proof Requests" value="628" helper="Controlled proof-generation workload." />
      <MetricCard label="Proof Failures" value="0" helper="No failed proof-generation requests." />
    </section>
  );
}
