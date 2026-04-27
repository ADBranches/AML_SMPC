import { MetricCard } from "../ui/MetricCard";

type ThroughputCardProps = {
  requests: number;
  failures: number;
  rps: number;
};

export function ThroughputCard({ requests, failures, rps }: ThroughputCardProps) {
  const impliedSeconds = 1000 / rps;

  return (
    <MetricCard
      label="Transaction Throughput"
      value={`${rps.toFixed(2)} req/s`}
      helper={`${requests} requests, ${failures} failures. 1000 transaction equivalent: ${impliedSeconds.toFixed(2)} seconds.`}
    />
  );
}
