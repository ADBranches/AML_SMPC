import csv
import json
from pathlib import Path
from datetime import datetime, timezone

root = Path("tests/evidence/phase7_2")
root.mkdir(parents=True, exist_ok=True)
report = root / "PHASE_7_2_PERFORMANCE_RESULTS.md"

def read_aggregated(prefix: str) -> dict:
    path = root / f"{prefix}_stats.csv"
    if not path.exists():
        return {}

    with path.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    for row in rows:
        if row.get("Name") == "Aggregated":
            return row

    return rows[-1] if rows else {}

def failure_rows(prefix: str) -> int:
    path = root / f"{prefix}_failures.csv"
    if not path.exists():
        return 0

    with path.open(newline="", encoding="utf-8") as f:
        return len(list(csv.DictReader(f)))

def value(row: dict, *keys: str) -> str:
    for key in keys:
        if key in row:
            return row[key]
    return ""

def as_int(raw: str) -> int:
    try:
        return int(float(raw))
    except Exception:
        return 0

def as_float(raw: str):
    try:
        return float(raw)
    except Exception:
        return None

tx = read_aggregated("transactions")
proofs = read_aggregated("proofs")

duration_path = root / "transactions_duration.json"
elapsed = None
if duration_path.exists():
    elapsed = json.loads(duration_path.read_text()).get("elapsed_seconds")

tx_requests = as_int(value(tx, "Request Count"))
tx_failures = as_int(value(tx, "Failure Count"))
tx_rps = value(tx, "Requests/s")
tx_p50 = value(tx, "50%", "Median Response Time")
tx_p95 = value(tx, "95%")
tx_p99 = value(tx, "99%")
tx_failure_rows = failure_rows("transactions")

proof_requests = as_int(value(proofs, "Request Count"))
proof_failures = as_int(value(proofs, "Failure Count"))
proof_p50 = value(proofs, "50%", "Median Response Time")
proof_p95 = value(proofs, "95%")
proof_p99 = value(proofs, "99%")
proof_failure_rows = failure_rows("proofs")

tx_pass = (
    tx_requests >= 1000
    and tx_failures == 0
    and tx_failure_rows == 0
    and elapsed is not None
    and elapsed < 5
)

proof_p95_float = as_float(proof_p95)
proof_pass = (
    proof_requests > 0
    and proof_failures == 0
    and proof_failure_rows == 0
    and proof_p95_float is not None
    and proof_p95_float < 100
)

elapsed_text = "not recorded" if elapsed is None else f"{elapsed:.3f} seconds"

report.write_text(f"""# Phase 7.2 Performance Results

Generated: {datetime.now(timezone.utc).isoformat()}

## Transaction Submission Benchmark

Target: 1000 transactions in under 5 seconds.

Observed:
- Request count: {tx_requests}
- Failure count: {tx_failures}
- Failure rows: {tx_failure_rows}
- Requests per second: {tx_rps}
- Median response time: {tx_p50}
- P95 response time: {tx_p95}
- P99 response time: {tx_p99}
- Elapsed wall-clock time: {elapsed_text}

Status: {"PASS" if tx_pass else "REVIEW REQUIRED"}

## zk Proof Generation Benchmark

Target: proof generation requests complete successfully with P95 below 100 ms for the controlled demo workload.

Observed:
- Request count: {proof_requests}
- Failure count: {proof_failures}
- Failure rows: {proof_failure_rows}
- Median response time: {proof_p50}
- P95 response time: {proof_p95}
- P99 response time: {proof_p99}

Status: {"PASS" if proof_pass else "REVIEW REQUIRED"}

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
""", encoding="utf-8")

print(f"Wrote {report}")
