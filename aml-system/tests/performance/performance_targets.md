# Phase 7.2 Performance Targets

## Purpose

Phase 7.2 measures throughput and latency for the AML SMPC system using Locust.

## Primary KPIs

### KPI 1 — Transaction Submission Throughput

Target: 1000 transaction submissions completed in under 5 seconds.

Evidence required:
- tests/evidence/phase7_2/performance/locust_transaction_submission_summary.log
- tests/evidence/phase7_2/performance/locust_transaction_submission_stats.csv

### KPI 2 — API Error Rate

Target: 0 critical server errors during controlled performance run.

Evidence required:
- Locust failures table must be empty or explainable.

### KPI 3 — Average Response Time

Target: average transaction submission latency should remain acceptable for demo-scale workload.

## Test Dataset

The performance dataset is stored at tests/fixtures/performance_transactions.json.

Expected transaction count: 1000.

## Execution Scope

Phase 7.2 performance tests focus on:
- transaction submission API
- SMPC screening dependency path
- database insert path
- audit log creation path

## Exit Criteria

Phase 7.2 passes when:
- the performance fixture loads correctly
- Locust can submit transactions using the fixture
- throughput and latency are recorded
- failures are captured
- all evidence is stored under tests/evidence/phase7_2/
