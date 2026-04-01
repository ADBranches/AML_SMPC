#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_DIR="$ROOT_DIR/tests"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$TEST_DIR/logs" "$TEST_DIR/evidence"

REGULATOR_API_BASE_URL="${REGULATOR_API_BASE_URL:-http://127.0.0.1:8085}"
ZK_PROVER_BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
LOG_DIR="$TEST_DIR/logs/functional/api"
EVIDENCE_DIR="$TEST_DIR/evidence/functional/api"
FIXTURE="$TEST_DIR/fixtures/zk_claim_cases.json"
LOG_FILE="$LOG_DIR/regulator_flow_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/regulator_flow_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$REGULATOR_API_BASE_URL" "$ZK_PROVER_BASE_URL" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys, urllib.request
reg_url, zk_url, log_file, evidence_file = sys.argv[1:5]
# Ensure proofs exist
req = urllib.request.Request(zk_url+'/proofs/generate', data=json.dumps({'tx_id':'TX-E2E-001'}).encode(), headers={'Content-Type':'application/json'}, method='POST')
with urllib.request.urlopen(req) as resp:
    proofs = json.loads(resp.read().decode('utf-8'))
proof_id = proofs[0]['id']
tx_id = proofs[0]['tx_id']
with urllib.request.urlopen(reg_url+f'/proofs?tx_id={tx_id}') as resp:
    list_status = resp.status
    list_body = json.loads(resp.read().decode('utf-8'))
with urllib.request.urlopen(reg_url+f'/proofs/{proof_id}') as resp:
    get_status = resp.status
    get_body = json.loads(resp.read().decode('utf-8'))
reqv = urllib.request.Request(reg_url+f'/proofs/{proof_id}/verify', data=b'', method='POST')
with urllib.request.urlopen(reqv) as resp:
    verify_status = resp.status
    verify_body = json.loads(resp.read().decode('utf-8'))
with urllib.request.urlopen(reg_url+f'/audit/{tx_id}') as resp:
    audit_status = resp.status
    audit_body = json.loads(resp.read().decode('utf-8'))
passed = all(s == 200 for s in [list_status, get_status, verify_status, audit_status]) and verify_body.get('proof_id') == proof_id
record = {'proof_id': proof_id, 'tx_id': tx_id, 'statuses': {'list': list_status, 'get': get_status, 'verify': verify_status, 'audit': audit_status}, 'passed': passed}
open(log_file,'w').write(json.dumps(record, indent=2))
open(evidence_file,'w').write(json.dumps({'record': record, 'list_body': list_body, 'get_body': get_body, 'verify_body': verify_body, 'audit_body': audit_body}, indent=2))
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] Regulator flow test completed. Evidence: $EVIDENCE_FILE"
