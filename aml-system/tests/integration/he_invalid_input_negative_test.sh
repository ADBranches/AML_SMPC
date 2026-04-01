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
LOG_FILE="$LOG_DIR/he_invalid_input_negative_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/he_invalid_input_negative_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$FIXTURE_IN" "$FIXTURE_OUT" "$HE_BASE_URL" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys, urllib.request, urllib.error
fixture_in, fixture_out, base_url, log_file, evidence_file = sys.argv[1:6]
with open(fixture_in,'r',encoding='utf-8') as f:
    tin=json.load(f)
with open(fixture_out,'r',encoding='utf-8') as f:
    tout=json.load(f)
expected = {x['name']: x['expected_http_status'] for x in tout['negative']}
results=[]
for case in tin['negative']:
    path = '/he/decrypt-test' if 'ciphertext_hex' in case['request'] else '/he/encrypt'
    req = urllib.request.Request(base_url+path, data=json.dumps(case['request']).encode(), headers={'Content-Type':'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            body = resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        status = e.code
        body = e.read().decode('utf-8')
    ok = status == expected[case['name']]
    results.append({'name': case['name'], 'path': path, 'status': status, 'expected_status': expected[case['name']], 'passed': ok, 'body': body})
passed = all(r['passed'] for r in results)
open(log_file,'w').write(json.dumps({'results': results, 'passed': passed}, indent=2))
open(evidence_file,'w').write(json.dumps({'results': results, 'passed': passed}, indent=2))
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] HE invalid input negative test completed. Evidence: $EVIDENCE_FILE"
