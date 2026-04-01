#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$ROOT_DIR/tests/logs/environment"
EVIDENCE_DIR="$ROOT_DIR/tests/evidence/environment"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="$LOG_DIR/script_naming_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/script_naming_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$ROOT_DIR" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys
from pathlib import Path
root = Path(sys.argv[1])
log_file = Path(sys.argv[2])
evidence_file = Path(sys.argv[3])

official_doc = root / 'docs/demo/demo-environment-baseline.md'
required_active = [
    'scripts/demo/run_phase7_1.sh',
    'scripts/demo/run_phase7_2.sh',
    'scripts/demo/run_phase7_3.sh',
    'scripts/demo/run-phase7-validation.sh',
]
missing = [p for p in required_active if not (root / p).exists()]
text = official_doc.read_text(encoding='utf-8') if official_doc.exists() else ''
mentioned = all(p in text for p in required_active)
passed = official_doc.exists() and not missing and mentioned
record = {
    'test': 'script_naming_test',
    'official_doc_exists': official_doc.exists(),
    'missing_active_scripts': missing,
    'official_doc_mentions_active_scripts': mentioned,
    'passed': passed,
}
for path in [log_file, evidence_file]:
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(record, f, indent=2)
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] Script naming test completed. Evidence: $EVIDENCE_FILE"