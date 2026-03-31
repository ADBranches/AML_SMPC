#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_DIR="$ROOT_DIR/tests"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$TEST_DIR/logs" "$TEST_DIR/evidence"

DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5433/aml_dev}"
ENCRYPTION_SERVICE_BASE_URL="${ENCRYPTION_SERVICE_BASE_URL:-http://127.0.0.1:8081}"
LOG_DIR="$TEST_DIR/logs/functional/api"
EVIDENCE_DIR="$TEST_DIR/evidence/functional/api"
FIXTURE="$TEST_DIR/fixtures/e2e_transactions.json"
LOG_FILE="$LOG_DIR/e2e_invalid_payload_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/e2e_invalid_payload_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$ENCRYPTION_SERVICE_BASE_URL" "$FIXTURE" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys, urllib.request, urllib.error
base_url, fixture, log_file, evidence_file = sys.argv[1:5]
cases = json.load(open(fixture, encoding='utf-8'))['negative']
results = []
for case in cases:
    req = urllib.request.Request(base_url+'/transactions/submit', data=json.dumps(case['request']).encode(), headers={'Content-Type':'application/json'}, method='POST')
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

echo "[PASS] E2E invalid payload test completed. Evidence: $EVIDENCE_FILE"
