#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_DIR="$ROOT_DIR/tests"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$TEST_DIR/logs" "$TEST_DIR/evidence"

HE_BASE_URL="${HE_GATEWAY_BASE_URL:-http://127.0.0.1:8082}"
LOG_DIR="$TEST_DIR/logs/functional/he"
EVIDENCE_DIR="$TEST_DIR/evidence/functional/he"
FIXTURE_IN="$TEST_DIR/fixtures/he_test_vectors.json"
FIXTURE_OUT="$TEST_DIR/fixtures/he_expected_outputs.json"
LOG_FILE="$LOG_DIR/he_encrypt_decrypt_positive_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/he_encrypt_decrypt_positive_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$FIXTURE_IN" "$FIXTURE_OUT" "$HE_BASE_URL" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys, urllib.request
fixture_in, fixture_out, base_url, log_file, evidence_file = sys.argv[1:6]
with open(fixture_in, 'r', encoding='utf-8') as f:
    tin = json.load(f)
with open(fixture_out, 'r', encoding='utf-8') as f:
    tout = json.load(f)
case = tin['positive'][0]
expected = tout['positive'][0]

def post(path, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(base_url + path, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

status1, enc1 = post('/he/encrypt', {'amount': case['lhs_amount']})
status2, enc2 = post('/he/encrypt', {'amount': case['rhs_amount']})
status3, summed = post('/he/sum', {'lhs_ciphertext_hex': enc1['ciphertext_hex'], 'rhs_ciphertext_hex': enc2['ciphertext_hex']})
status4, dec = post('/he/decrypt-test', {'ciphertext_hex': summed['result_ciphertext_hex']})
observed = float(dec['amount'])
passed = all(s == 200 for s in [status1, status2, status3, status4]) and abs(observed - expected['expected_sum']) <= expected['tolerance']
record = {
    'test': 'he_encrypt_decrypt_positive_test',
    'statuses': [status1, status2, status3, status4],
    'lhs_amount': case['lhs_amount'],
    'rhs_amount': case['rhs_amount'],
    'observed_sum': observed,
    'expected_sum': expected['expected_sum'],
    'tolerance': expected['tolerance'],
    'passed': passed,
}
with open(log_file, 'w', encoding='utf-8') as f:
    json.dump(record, f, indent=2)
with open(evidence_file, 'w', encoding='utf-8') as f:
    json.dump({
        **record,
        'encrypt_1': enc1,
        'encrypt_2': enc2,
        'sum': summed,
        'decrypt': dec,
    }, f, indent=2)
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] HE encrypt/decrypt positive test completed. Evidence: $EVIDENCE_FILE"
