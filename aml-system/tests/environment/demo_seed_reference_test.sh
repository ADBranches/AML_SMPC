#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$ROOT_DIR/tests/logs/environment"
EVIDENCE_DIR="$ROOT_DIR/tests/evidence/environment"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="$LOG_DIR/demo_seed_reference_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/demo_seed_reference_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

source "$ROOT_DIR/scripts/demo/demo-env.sh"

python3 - <<'PY' "$ROOT_DIR" "$DEMO_TX_ID" "$PERF_PROOF_TX_ID" "$COMPLIANCE_TX_ID" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys
from pathlib import Path
root = Path(sys.argv[1])
demo_tx, perf_tx, comp_tx, log_file, evidence_file = sys.argv[2:7]
baseline_doc = (root / 'docs/demo/demo-environment-baseline.md').read_text(encoding='utf-8')
expected = 'TX-E2E-001'
passed = all(v == expected for v in [demo_tx, perf_tx, comp_tx]) and expected in baseline_doc
record = {
    'test': 'demo_seed_reference_test',
    'DEMO_TX_ID': demo_tx,
    'PERF_PROOF_TX_ID': perf_tx,
    'COMPLIANCE_TX_ID': comp_tx,
    'expected': expected,
    'baseline_doc_contains_expected': expected in baseline_doc,
    'passed': passed,
}
for path in [log_file, evidence_file]:
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(record, f, indent=2)
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] Demo seed reference test completed. Evidence: $EVIDENCE_FILE"