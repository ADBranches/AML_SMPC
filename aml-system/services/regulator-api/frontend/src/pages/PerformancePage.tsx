import { LatencyBarChart } from "../components/performance/LatencyBarChart";
import { LatencyCard } from "../components/performance/LatencyCard";
import { PerformanceMetricGrid } from "../components/performance/PerformanceMetricGrid";
import { PerformanceNotes } from "../components/performance/PerformanceNotes";
import { ThroughputCard } from "../components/performance/ThroughputCard";
import { PageHeader } from "../components/ui/PageHeader";

export function PerformancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Evidence"
        description="Visual summary of Phase 7.2 transaction throughput and zk proof-generation latency."
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <ThroughputCard requests={10091} failures={0} rps={339.92353492474865} />
        <LatencyCard median={46} p95={58} p99={66} />
      </section>

      <PerformanceMetricGrid />
      <LatencyBarChart />
      <PerformanceNotes />
    </div>
  );
}
