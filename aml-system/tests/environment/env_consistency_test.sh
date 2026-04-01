#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$ROOT_DIR/tests/logs/environment"
EVIDENCE_DIR="$ROOT_DIR/tests/evidence/environment"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="$LOG_DIR/env_consistency_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/env_consistency_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

set +e
OUTPUT="$($ROOT_DIR/scripts/dev/check-env-consistency.sh 2>&1)"
STATUS=$?
set -e

python3 - <<'PY' "$STATUS" "$OUTPUT" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys
status = int(sys.argv[1])
output = sys.argv[2]
log_file = sys.argv[3]
evidence_file = sys.argv[4]
record = {
    'test': 'env_consistency_test',
    'exit_status': status,
    'passed': status == 0,
    'output': output,
}
for path in [log_file, evidence_file]:
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(record, f, indent=2)
if status != 0:
    raise SystemExit(1)
PY

echo "[PASS] Environment consistency test completed. Evidence: $EVIDENCE_FILE"