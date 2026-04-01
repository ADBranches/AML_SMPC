#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_DIR="$ROOT_DIR/tests"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$TEST_DIR/logs" "$TEST_DIR/evidence"

SMPC_BASE_URL="${SMPC_BASE_URL:-http://127.0.0.1:8083}"
LOG_DIR="$TEST_DIR/logs/functional/smpc"
EVIDENCE_DIR="$TEST_DIR/evidence/functional/smpc"
LOG_FILE="$LOG_DIR/smpc_api_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/smpc_api_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$SMPC_BASE_URL" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys, urllib.request
base_url, log_file, evidence_file = sys.argv[1:4]
req = urllib.request.Request(base_url+'/smpc/screen', data=json.dumps({'tx_id':'TX-SMPC-SMOKE','entity_id':1007}).encode(), headers={'Content-Type':'application/json'}, method='POST')
with urllib.request.urlopen(req) as resp:
    status = resp.status
    body = json.loads(resp.read().decode('utf-8'))
passed = status == 200 and 'screening_result' in body
record = {'status': status, 'body': body, 'passed': passed}
open(log_file,'w').write(json.dumps(record, indent=2))
open(evidence_file,'w').write(json.dumps(record, indent=2))
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] SMPC API smoke test completed. Evidence: $EVIDENCE_FILE"
