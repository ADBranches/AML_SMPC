#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib_phase71.sh"

phase71_load_env
phase71_require_common
phase71_require_cmd psql

TX_ID="TX-PHASE71-E2E-001"
ENCRYPTION_URL="${ENCRYPTION_SERVICE_BASE_URL:-http://127.0.0.1:8081}"
ZK_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
REGULATOR_URL="${REGULATOR_API_BASE_URL:-http://127.0.0.1:8085}"
OUT="$EVIDENCE_DIR/api_end_to_end_test.log"

{
  echo "Running Phase 7.1 API end-to-end test..."

  psql_url="$(phase71_psql_url)"
  psql "$psql_url" -v ON_ERROR_STOP=1 <<SQL
DELETE FROM proofs WHERE tx_id = '$TX_ID';
DELETE FROM audit_logs WHERE tx_id = '$TX_ID';
DELETE FROM transactions WHERE tx_id = '$TX_ID';
SQL

  phase71_start_smpc_runtime
  phase71_start_encryption_service
  phase71_start_zk_prover
  phase71_start_regulator_api

  payload="$(jq -c '.transaction' "$ROOT_DIR/tests/fixtures/e2e_transactions.json")"

  submit_response="$(curl -fsS -X POST "$ENCRYPTION_URL/transactions/submit" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    | tee "$EVIDENCE_DIR/e2e_transaction_submit_response.json")"

  submitted_tx_id="$(echo "$submit_response" | jq -r '.tx_id')"
  status="$(echo "$submit_response" | jq -r '.status')"

  test "$submitted_tx_id" = "$TX_ID"
  test "$status" = "screened_clear"

  proof_response="$(curl -fsS -X POST "$ZK_URL/proofs/generate" \
    -H "Content-Type: application/json" \
    -d "{\"tx_id\":\"$TX_ID\"}" \
    | tee "$EVIDENCE_DIR/e2e_proof_generation_response.json")"

  proof_count="$(echo "$proof_response" | jq 'length')"
  test "$proof_count" -ge 3

  regulator_proofs="$(curl -fsS "$REGULATOR_URL/proofs?tx_id=$TX_ID" \
    | tee "$EVIDENCE_DIR/e2e_regulator_proofs_response.json")"

  regulator_count="$(echo "$regulator_proofs" | jq 'length')"
  test "$regulator_count" -ge 3

  audit_response="$(curl -fsS "$REGULATOR_URL/audit/$TX_ID" \
    | tee "$EVIDENCE_DIR/e2e_regulator_audit_response.json")"

  audit_count="$(echo "$audit_response" | jq 'length')"
  test "$audit_count" -ge 3

  proof_id="$(echo "$regulator_proofs" | jq -r '.[0].id')"
  test "$proof_id" != "null"
  test -n "$proof_id"

  verify_response="$(curl -fsS -X POST "$REGULATOR_URL/proofs/$proof_id/verify" \
    | tee "$EVIDENCE_DIR/e2e_regulator_verify_response.json")"

  verified="$(echo "$verify_response" | jq -r '.verified')"
  test "$verified" = "true"

  echo "Phase 7.1 API end-to-end test PASSED"
} | tee "$OUT"
