#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib_phase71.sh"

phase71_load_env
phase71_require_common
phase71_require_cmd psql

TX_ID="${1:-TX-PHASE71-ZKVERIFY-001}"
BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
OUT="$EVIDENCE_DIR/zk_proof_verification_test.log"

{
  echo "Running zk proof verification test for tx_id=$TX_ID"

  phase71_seed_zk_transaction "$TX_ID"
  phase71_start_zk_prover

  response="$(phase71_generate_proofs "$TX_ID" | tee "$EVIDENCE_DIR/zk_verify_generate_response.json")"

  proof_id="$(echo "$response" | jq -r '.[0].id')"
  test "$proof_id" != "null"
  test -n "$proof_id"

  verify_response="$(curl -fsS -X POST "$BASE_URL/proofs/$proof_id/verify" \
    | tee "$EVIDENCE_DIR/zk_verify_response.json")"

  verified="$(echo "$verify_response" | jq -r '.verified')"
  test "$verified" = "true"

  echo "zk proof verification test PASSED"
} | tee "$OUT"
