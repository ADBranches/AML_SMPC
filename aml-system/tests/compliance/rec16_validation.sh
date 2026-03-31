#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_DIR="$ROOT_DIR/tests"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$TEST_DIR/logs" "$TEST_DIR/evidence"

DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5433/aml_dev}"
LOG_DIR="$TEST_DIR/logs/compliance"
EVIDENCE_DIR="$TEST_DIR/evidence/compliance"
LOG_FILE="$LOG_DIR/rec16_validation_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/rec16_validation_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$DATABASE_URL" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys, subprocess
DATABASE_URL, log_file, evidence_file = sys.argv[1:4]
meta_cmd = ['psql', DATABASE_URL, '-At', '-c', "SELECT count(*) FROM transactions WHERE tx_id = 'TX-E2E-001' AND coalesce(originator_institution,'') <> '' AND coalesce(beneficiary_institution,'') <> ''; "]
proof_cmd = ['psql', DATABASE_URL, '-At', '-c', "SELECT count(*) FROM proofs WHERE tx_id = 'TX-E2E-001' AND rule_id = 'FATF_REC16';"]
meta_count = int(subprocess.run(meta_cmd, capture_output=True, text=True, check=True).stdout.strip() or '0')
proof_count = int(subprocess.run(proof_cmd, capture_output=True, text=True, check=True).stdout.strip() or '0')
passed = meta_count >= 1 and proof_count >= 1
record = {'rule_id': 'FATF_REC16', 'metadata_count': meta_count, 'proof_count': proof_count, 'passed': passed, 'assertion': 'Travel-rule metadata exists and corresponding proof is present'}
open(log_file,'w').write(json.dumps(record, indent=2))
open(evidence_file,'w').write(json.dumps(record, indent=2))
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] Rec16 validation completed. Evidence: $EVIDENCE_FILE"
