#!/usr/bin/env bash
set -euo pipefail

echo "============================================================"
echo "PHASE 7 COMPLETION VERIFICATION"
echo "============================================================"

echo
echo "Checking Phase 7.1 evidence..."
test -f tests/evidence/phase7_1/api_end_to_end_test.log
grep -R "PASSED" tests/evidence/phase7_1/*.log >/dev/null
echo "✅ Phase 7.1 evidence found"

echo
echo "Checking Phase 7.2 performance evidence..."
test -f tests/evidence/phase7_2/transactions_stats.csv
test -f tests/evidence/phase7_2/proofs_stats.csv
test -f tests/evidence/phase7_2/PHASE_7_2_PERFORMANCE_RESULTS.md

python3 - <<'PY'
import csv
from pathlib import Path

root = Path("tests/evidence/phase7_2")

def aggregated(prefix):
    with (root / f"{prefix}_stats.csv").open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        if row.get("Name") == "Aggregated":
            return row
    raise SystemExit(f"No aggregated row for {prefix}")

def num(row, key):
    try:
        return float(row.get(key, 0))
    except Exception:
        return 0.0

tx = aggregated("transactions")
proofs = aggregated("proofs")

assert num(tx, "Request Count") >= 1000
assert num(tx, "Failure Count") == 0
assert num(tx, "Requests/s") >= 200

assert num(proofs, "Request Count") > 0
assert num(proofs, "Failure Count") == 0
assert num(proofs, "95%") < 100

print("✅ Phase 7.2 performance evidence passed")
PY

echo
echo "Checking Phase 7.3 compliance evidence..."
test -f tests/evidence/phase7_3/PHASE_7_3_COMPLIANCE_RESULTS.md

grep -q '`PASSED`' tests/evidence/phase7_3/PHASE_7_3_COMPLIANCE_RESULTS.md

jq -e '.verified == true' tests/evidence/phase7_3/TX-PHASE73-R10-001_r10_verify_response.json >/dev/null
jq -e '.verified == true' tests/evidence/phase7_3/TX-PHASE73-R11-001_r11_verify_response.json >/dev/null
jq -e '.verified == true' tests/evidence/phase7_3/TX-PHASE73-R16-001_r16_verify_response.json >/dev/null

echo "✅ Phase 7.3 compliance evidence passed"

echo
echo "============================================================"
echo "✅ PHASE 7.1, 7.2, AND 7.3 ARE COMPLETE"
echo "============================================================"
