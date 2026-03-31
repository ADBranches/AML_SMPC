#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_DIR="$ROOT_DIR/tests"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$TEST_DIR/logs" "$TEST_DIR/evidence"

SMPC_BASE_URL="${SMPC_BASE_URL:-http://127.0.0.1:8083}"
LOG_DIR="$TEST_DIR/logs/functional/smpc"
EVIDENCE_DIR="$TEST_DIR/evidence/functional/smpc"
FIXTURE="$TEST_DIR/fixtures/smpc_test_cases.json"
LOG_FILE="$LOG_DIR/smpc_invalid_entity_negative_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/smpc_invalid_entity_negative_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$FIXTURE" "$SMPC_BASE_URL" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys, urllib.request, urllib.error
fixture, base_url, log_file, evidence_file = sys.argv[1:5]
cases = json.load(open(fixture, encoding='utf-8'))['negative']
results = []
for case in cases:
    req = urllib.request.Request(base_url+'/smpc/screen', data=json.dumps(case['request']).encode(), headers={'Content-Type':'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            body = resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        status = e.code
        body = e.read().decode('utf-8')
    ok = status == case['expected_http_status']
    results.append({'name': case['name'], 'status': status, 'expected_status': case['expected_http_status'], 'passed': ok, 'body': body})
passed = all(r['passed'] for r in results)
open(log_file,'w').write(json.dumps({'results': results, 'passed': passed}, indent=2))
open(evidence_file,'w').write(json.dumps({'results': results, 'passed': passed}, indent=2))
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] SMPC invalid entity negative test completed. Evidence: $EVIDENCE_FILE"
