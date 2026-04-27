import { MetricCard } from "../ui/MetricCard";

type LatencyCardProps = {
  p95: number;
  median: number;
  p99: number;
};

export function LatencyCard({ p95, median, p99 }: LatencyCardProps) {
  return (
    <MetricCard
      label="zk Proof Generation Latency"
      value={`${p95} ms P95`}
      helper={`Median: ${median} ms. P99: ${p99} ms. Target: below 100 ms.`}
    />
  );
}
