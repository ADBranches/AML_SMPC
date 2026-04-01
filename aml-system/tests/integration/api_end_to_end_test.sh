#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_DIR="$ROOT_DIR/tests"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$TEST_DIR/logs" "$TEST_DIR/evidence"

DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5434/aml_dev}"
ENCRYPTION_SERVICE_BASE_URL="${ENCRYPTION_SERVICE_BASE_URL:-http://127.0.0.1:8081}"
ZK_PROVER_BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
LOG_DIR="$TEST_DIR/logs/functional/api"
EVIDENCE_DIR="$TEST_DIR/evidence/functional/api"
FIXTURE="$TEST_DIR/fixtures/e2e_transactions.json"
LOG_FILE="$LOG_DIR/api_end_to_end_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/api_end_to_end_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$DATABASE_URL" "$ENCRYPTION_SERVICE_BASE_URL" "$ZK_PROVER_BASE_URL" "$FIXTURE" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys, urllib.request, subprocess
DATABASE_URL, enc_url, zk_url, fixture, log_file, evidence_file = sys.argv[1:7]
case = json.load(open(fixture, encoding='utf-8'))['positive'][0]
tx_id = case['request']['tx_id']
# Cleanup prior artifacts to make reruns deterministic
cleanup_sql = f"DELETE FROM proofs WHERE tx_id = '{tx_id}'; DELETE FROM audit_logs WHERE tx_id = '{tx_id}'; DELETE FROM transactions WHERE tx_id = '{tx_id}';"
subprocess.run(['psql', DATABASE_URL, '-v', 'ON_ERROR_STOP=1', '-c', cleanup_sql], capture_output=True, text=True, check=True)
# Submit transaction
req = urllib.request.Request(enc_url+'/transactions/submit', data=json.dumps(case['request']).encode(), headers={'Content-Type':'application/json'}, method='POST')
with urllib.request.urlopen(req) as resp:
    submit_status = resp.status
    submit_body = json.loads(resp.read().decode('utf-8'))
# Generate proofs for tx
req2 = urllib.request.Request(zk_url+'/proofs/generate', data=json.dumps({'tx_id': submit_body['tx_id']}).encode(), headers={'Content-Type':'application/json'}, method='POST')
with urllib.request.urlopen(req2) as resp:
    proofs_status = resp.status
    proofs_body = json.loads(resp.read().decode('utf-8'))
# Check DB persistence
q = subprocess.run(['psql', DATABASE_URL, '-At', '-c', f"SELECT count(*) FROM transactions WHERE tx_id = '{submit_body['tx_id']}';"], capture_output=True, text=True, check=True)
count = int(q.stdout.strip())
passed = submit_status == 201 and proofs_status == 200 and count == 1 and len(proofs_body) >= 3
record = {'submit_status': submit_status, 'proofs_status': proofs_status, 'tx_id': submit_body['tx_id'], 'proof_count': len(proofs_body), 'db_transaction_count': count, 'passed': passed}
open(log_file,'w').write(json.dumps(record, indent=2))
open(evidence_file,'w').write(json.dumps({'record': record, 'submit_body': submit_body, 'proofs_body': proofs_body}, indent=2))
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] API end-to-end test completed. Evidence: $EVIDENCE_FILE"
