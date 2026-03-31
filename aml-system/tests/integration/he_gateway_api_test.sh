#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_DIR="$ROOT_DIR/tests"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$TEST_DIR/logs" "$TEST_DIR/evidence"

HE_BASE_URL="${HE_GATEWAY_BASE_URL:-http://127.0.0.1:8082}"
LOG_DIR="$TEST_DIR/logs/functional/he"
EVIDENCE_DIR="$TEST_DIR/evidence/functional/he"
LOG_FILE="$LOG_DIR/he_gateway_api_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/he_gateway_api_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$HE_BASE_URL" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys, urllib.request
base_url, log_file, evidence_file = sys.argv[1:4]

def get(path):
    req = urllib.request.Request(base_url + path, method='GET')
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def post(path, payload):
    req = urllib.request.Request(base_url + path, data=json.dumps(payload).encode(), headers={'Content-Type':'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))
health_s, health = get('/health')
enc_s, enc = post('/he/encrypt', {'amount': 10.0})
sum_s, summed = post('/he/sum', {'lhs_ciphertext_hex': enc['ciphertext_hex'], 'rhs_ciphertext_hex': enc['ciphertext_hex']})
dec_s, dec = post('/he/decrypt-test', {'ciphertext_hex': summed['result_ciphertext_hex']})
passed = (health_s, enc_s, sum_s, dec_s) == (200, 200, 200, 200)
record = {'health_status': health_s, 'encrypt_status': enc_s, 'sum_status': sum_s, 'decrypt_status': dec_s, 'decrypt_amount': dec['amount'], 'passed': passed}
open(log_file,'w').write(json.dumps(record, indent=2))
open(evidence_file,'w').write(json.dumps({'health': health, 'encrypt': enc, 'sum': summed, 'decrypt': dec, **record}, indent=2))
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] HE gateway API smoke test completed. Evidence: $EVIDENCE_FILE"
