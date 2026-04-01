#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_DIR="$ROOT_DIR/tests"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$TEST_DIR/logs" "$TEST_DIR/evidence"

DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5434/aml_dev}"
ZK_PROVER_BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
LOG_DIR="$TEST_DIR/logs/compliance"
EVIDENCE_DIR="$TEST_DIR/evidence/compliance"
LOG_FILE="$LOG_DIR/rec11_proof_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/rec11_proof_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$ZK_PROVER_BASE_URL" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys, urllib.request
base_url, log_file, evidence_file = sys.argv[1:4]
req = urllib.request.Request(base_url+'/proofs/generate', data=json.dumps({'tx_id':'TX-E2E-001'}).encode(), headers={'Content-Type':'application/json'}, method='POST')
with urllib.request.urlopen(req) as resp:
    proofs = json.loads(resp.read().decode('utf-8'))
matching = [p for p in proofs if p['rule_id'] == 'FATF_REC11']
passed = len(matching) == 1 and matching[0]['verification_status'] in ('generated', 'verified')
record = {'rule_id': 'FATF_REC11', 'match_count': len(matching), 'proof': matching[0] if matching else None, 'passed': passed}
open(log_file,'w').write(json.dumps(record, indent=2))
open(evidence_file,'w').write(json.dumps(record, indent=2))
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] rec11 proof test completed. Evidence: $EVIDENCE_FILE"
