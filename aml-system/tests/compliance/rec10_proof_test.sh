#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../integration" && pwd)"
source "$SCRIPT_DIR/lib_phase71.sh"

phase71_load_env
phase71_require_common
phase71_require_cmd psql

TX_ID="TX-PHASE71-REC10-001"
OUT="$EVIDENCE_DIR/rec10_proof_test.log"

{
  echo "Running FATF REC10 proof compliance test..."

  phase71_seed_zk_transaction "$TX_ID"
  phase71_start_zk_prover

  response="$(phase71_generate_proofs "$TX_ID" | tee "$EVIDENCE_DIR/rec10_generate_response.json")"

  echo "$response" | jq -e '.[] | select(.rule_id=="FATF_REC10" and .verification_status=="verified")' >/dev/null

  echo "FATF REC10 proof compliance test PASSED"
} | tee "$OUT"
