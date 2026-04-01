#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_DIR="$ROOT_DIR/tests"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$TEST_DIR/logs" "$TEST_DIR/evidence"

DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5434/aml_dev}"
ZK_PROVER_BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
LOG_DIR="$TEST_DIR/logs/functional/zk"
EVIDENCE_DIR="$TEST_DIR/evidence/functional/zk"
LOG_FILE="$LOG_DIR/zk_invalid_proof_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/zk_invalid_proof_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$DATABASE_URL" "$ZK_PROVER_BASE_URL" "$LOG_FILE" "$EVIDENCE_FILE"
import json, os, sys, subprocess, urllib.request
DATABASE_URL, base_url, log_file, evidence_file = sys.argv[1:5]
# Create a valid proof set first
req = urllib.request.Request(base_url+'/proofs/generate', data=json.dumps({'tx_id': 'TX-E2E-001'}).encode(), headers={'Content-Type':'application/json'}, method='POST')
with urllib.request.urlopen(req) as resp:
    proofs = json.loads(resp.read().decode('utf-8'))
proof_id = proofs[0]['id']
# Tamper claim_hash directly in DB, verify should fail
psql_cmd = [
    'psql', DATABASE_URL, '-At', '-c',
    f"UPDATE proofs SET claim_hash = 'deadbeef' WHERE id = '{proof_id}'::uuid; SELECT id::text FROM proofs WHERE id = '{proof_id}'::uuid;"
]
subprocess.run(psql_cmd, check=True, capture_output=True, text=True)
req2 = urllib.request.Request(base_url+f'/proofs/{proof_id}/verify', data=b'', method='POST')
with urllib.request.urlopen(req2) as resp:
    status = resp.status
    body = json.loads(resp.read().decode('utf-8'))
passed = status == 200 and body.get('verified') is False and 'mismatch' in body.get('reason','').lower()
record = {'proof_id': proof_id, 'status': status, 'verification': body, 'passed': passed}
open(log_file,'w').write(json.dumps(record, indent=2))
open(evidence_file,'w').write(json.dumps(record, indent=2))
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] ZK invalid proof test completed. Evidence: $EVIDENCE_FILE"
