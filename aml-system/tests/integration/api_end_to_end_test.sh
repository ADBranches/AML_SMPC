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

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "[error] missing required command: $1"
    exit 1
  }
}

wait_for_post_endpoint() {
  local url="$1"
  local name="$2"
  local retries="${3:-30}"

  echo "[wait] waiting for ${name} at ${url} ..."
  for ((i=1; i<=retries; i++)); do
    code="$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)"
    if [[ "$code" =~ ^(200|404|405)$ ]]; then
      echo "[ok] ${name} is reachable"
      return 0
    fi
    sleep 1
  done

  echo "[error] ${name} is not reachable at ${url}"
  echo "[hint] start the Phase 7 service stack first before running this standalone test"
  exit 1
}

require_cmd python3
require_cmd psql
require_cmd curl

wait_for_post_endpoint "${ENCRYPTION_SERVICE_BASE_URL}/transactions/submit" "encryption-service"
wait_for_post_endpoint "${ZK_PROVER_BASE_URL}/proofs/generate" "zk-prover"

python3 - <<'PY' "$DATABASE_URL" "$ENCRYPTION_SERVICE_BASE_URL" "$ZK_PROVER_BASE_URL" "$FIXTURE" "$LOG_FILE" "$EVIDENCE_FILE"
import json
import subprocess
import sys
import traceback
import urllib.error
import urllib.request

DATABASE_URL, enc_url, zk_url, fixture, log_file, evidence_file = sys.argv[1:7]

result = {
    "passed": False,
    "tx_id": None,
    "submit_status": None,
    "proofs_status": None,
    "proof_count": None,
    "db_transaction_count": None,
    "error": None,
    "error_type": None,
    "traceback": None,
}

submit_body = None
proofs_body = None

def write_outputs():
    with open(log_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    with open(evidence_file, "w", encoding="utf-8") as f:
        json.dump(
            {
                "record": result,
                "submit_body": submit_body,
                "proofs_body": proofs_body,
            },
            f,
            indent=2,
        )

try:
    with open(fixture, encoding="utf-8") as f:
        case = json.load(f)["positive"][0]

    tx_id = case["request"]["tx_id"]
    result["tx_id"] = tx_id

    cleanup_sql = (
        f"DELETE FROM proofs WHERE tx_id = '{tx_id}'; "
        f"DELETE FROM audit_logs WHERE tx_id = '{tx_id}'; "
        f"DELETE FROM transactions WHERE tx_id = '{tx_id}';"
    )

    subprocess.run(
        ["psql", DATABASE_URL, "-v", "ON_ERROR_STOP=1", "-c", cleanup_sql],
        capture_output=True,
        text=True,
        check=True,
    )

    req = urllib.request.Request(
        enc_url + "/transactions/submit",
        data=json.dumps(case["request"]).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        result["submit_status"] = resp.status
        submit_body = json.loads(resp.read().decode("utf-8"))

    req2 = urllib.request.Request(
        zk_url + "/proofs/generate",
        data=json.dumps({"tx_id": submit_body["tx_id"]}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req2, timeout=30) as resp:
        result["proofs_status"] = resp.status
        proofs_body = json.loads(resp.read().decode("utf-8"))

    q = subprocess.run(
        [
            "psql",
            DATABASE_URL,
            "-At",
            "-c",
            f"SELECT count(*) FROM transactions WHERE tx_id = '{submit_body['tx_id']}';",
        ],
        capture_output=True,
        text=True,
        check=True,
    )

    result["db_transaction_count"] = int(q.stdout.strip())
    result["proof_count"] = len(proofs_body)

    result["passed"] = (
        result["submit_status"] == 201
        and result["proofs_status"] == 200
        and result["db_transaction_count"] == 1
        and result["proof_count"] >= 3
    )

except Exception as e:
    result["error"] = str(e)
    result["error_type"] = type(e).__name__
    result["traceback"] = traceback.format_exc()

write_outputs()

if not result["passed"]:
    raise SystemExit(1)
PY

echo "[PASS] API end-to-end test completed. Evidence: $EVIDENCE_FILE"
