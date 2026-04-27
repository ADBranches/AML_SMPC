#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib_phase71.sh"

phase71_load_env
phase71_require_common
phase71_start_smpc_runtime

BASE_URL="${SMPC_BASE_URL:-http://127.0.0.1:8083}"
OUT="$EVIDENCE_DIR/smpc_match_test.log"

{
  echo "Running SMPC match test..."

  response="$(curl -fsS -X POST "$BASE_URL/smpc/screen" \
    -H "Content-Type: application/json" \
    -d '{"tx_id":"TX-SMPC-MATCH-001","entity_id":1007}' \
    | tee "$EVIDENCE_DIR/smpc_match_response.json")"

  result="$(echo "$response" | jq -r '.screening_result')"

  test "$result" = "match"

  echo "SMPC match test PASSED"
} | tee "$OUT"
