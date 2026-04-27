#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib_phase71.sh"

phase71_load_env
phase71_require_common
phase71_require_cmd psql

TX_ID="${1:-TX-PHASE71-ZK-001}"
BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
OUT="$EVIDENCE_DIR/zk_proof_generation_test.log"

{
  echo "Running zk proof generation test for tx_id=$TX_ID"

  phase71_seed_zk_transaction "$TX_ID"
  phase71_start_zk_prover

  response="$(phase71_generate_proofs "$TX_ID" | tee "$EVIDENCE_DIR/zk_generate_response.json")"

  count="$(echo "$response" | jq 'length')"
  test "$count" -ge 3

  echo "$response" | jq -e '.[] | select(.rule_id=="FATF_REC10")' >/dev/null
  echo "$response" | jq -e '.[] | select(.rule_id=="FATF_REC11")' >/dev/null
  echo "$response" | jq -e '.[] | select(.rule_id=="FATF_REC16")' >/dev/null

  echo "zk proof generation test PASSED"
} | tee "$OUT"
