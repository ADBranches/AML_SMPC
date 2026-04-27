# Phase 7.2 Performance Results

Generated: 2026-04-27T18:16:28.975152+00:00

## Transaction Submission Benchmark

Target: 1000 transactions in under 5 seconds.

Observed:
- Request count: 10091
- Failure count: 0
- Failure rows: 0
- Requests per second: 339.92353492474865
- Median response time: 200
- P95 response time: 380
- P99 response time: 970
- Elapsed wall-clock time: 32.981 seconds

Status: REVIEW REQUIRED

## zk Proof Generation Benchmark

Target: proof generation requests complete successfully with P95 below 100 ms for the controlled demo workload.

Observed:
- Request count: 628
- Failure count: 0
- Failure rows: 0
- Median response time: 46
- P95 response time: 58
- P99 response time: 66

Status: PASS

## Evidence Files

- tests/evidence/phase7_2/transactions_stats.csv
- tests/evidence/phase7_2/transactions_failures.csv
- tests/evidence/phase7_2/transactions_report.html
- tests/evidence/phase7_2/transactions_locust.log
- tests/evidence/phase7_2/proofs_stats.csv
- tests/evidence/phase7_2/proofs_failures.csv
- tests/evidence/phase7_2/proofs_report.html
- tests/evidence/phase7_2/proofs_locust.log

## Notes

This report intentionally avoids exposing raw customer data. The benchmark uses generated Phase 7.2 performance fixtures and seeded proof-generation records only.
