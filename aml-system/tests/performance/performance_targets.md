# Performance Targets

## Benchmark goals

- **1000 transactions < 5 seconds**
- **zk proof generation < 100 ms**

## Pass/fail thresholds

### Transaction submission

Pass if:

- throughput and total duration meet the target, or
- any deviation is documented together with observed bottlenecks.

### Proof generation

Pass if:

- the selected latency statistic (mean or p95, depending run design) is within target,
- and failure rate remains acceptable.

## Metrics to retain

- request count,
- requests per second,
- mean latency,
- p95 / p99 latency,
- failure rate,
- CPU observations from monitoring,
- proof generation count.
