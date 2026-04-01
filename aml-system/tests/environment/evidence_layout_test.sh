#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$ROOT_DIR/tests/logs/environment"
EVIDENCE_DIR="$ROOT_DIR/tests/evidence/environment"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="$LOG_DIR/evidence_layout_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/evidence_layout_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$ROOT_DIR" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys
from pathlib import Path
root = Path(sys.argv[1])
log_file = Path(sys.argv[2])
evidence_file = Path(sys.argv[3])

bad_evidence_scripts = sorted(str(p.relative_to(root)) for p in (root / 'tests/evidence').rglob('*.sh'))
bad_log_json = sorted(str(p.relative_to(root)) for p in (root / 'tests/logs').rglob('*.json'))
passed = not bad_evidence_scripts and not bad_log_json
record = {
    'test': 'evidence_layout_test',
    'bad_evidence_scripts': bad_evidence_scripts,
    'bad_log_json': bad_log_json,
    'passed': passed,
}
for path in [log_file, evidence_file]:
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(record, f, indent=2)
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] Evidence layout test completed. Evidence: $EVIDENCE_FILE"