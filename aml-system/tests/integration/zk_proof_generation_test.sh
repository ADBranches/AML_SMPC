#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_DIR="$ROOT_DIR/tests"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$TEST_DIR/logs" "$TEST_DIR/evidence"

ZK_PROVER_BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
LOG_DIR="$TEST_DIR/logs/functional/zk"
EVIDENCE_DIR="$TEST_DIR/evidence/functional/zk"
FIXTURE="$TEST_DIR/fixtures/zk_claim_cases.json"
LOG_FILE="$LOG_DIR/zk_proof_generation_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/zk_proof_generation_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$FIXTURE" "$ZK_PROVER_BASE_URL" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys, urllib.request
fixture, base_url, log_file, evidence_file = sys.argv[1:5]
case = json.load(open(fixture, encoding='utf-8'))['generate'][0]
req = urllib.request.Request(base_url+'/proofs/generate', data=json.dumps({'tx_id': case['tx_id']}).encode(), headers={'Content-Type':'application/json'}, method='POST')
with urllib.request.urlopen(req) as resp:
    status = resp.status
    body = json.loads(resp.read().decode('utf-8'))
rule_ids = [item['rule_id'] for item in body]
passed = status == 200 and all(rule in rule_ids for rule in case['expected_rules']) and len(body) >= 3
record = {'status': status, 'expected_rules': case['expected_rules'], 'returned_rule_ids': rule_ids, 'proof_count': len(body), 'passed': passed}
open(log_file,'w').write(json.dumps(record, indent=2))
open(evidence_file,'w').write(json.dumps({'record': record, 'proofs': body}, indent=2))
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] ZK proof generation test completed. Evidence: $EVIDENCE_FILE"
