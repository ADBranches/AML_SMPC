#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib_phase73.sh"

TX_ID="${1:-TX-PHASE73-R10-001}"
OUT="$EVIDENCE_DIR/${TX_ID}_r10_cdd_validation.log"

{
  echo "Running Phase 7.3 R.10 Customer Due Diligence validation for $TX_ID"

  phase73_prepare_full_evidence_flow "$TX_ID"

  proof_id="$(phase73_get_proof_id "$TX_ID" "FATF_REC10")"
  test -n "$proof_id"
  test "$proof_id" != "null"

  detail_file="$EVIDENCE_DIR/${TX_ID}_r10_proof_detail.json"
  verify_file="$EVIDENCE_DIR/${TX_ID}_r10_verify_response.json"

  phase73_get_proof_detail "$proof_id" "$detail_file"
  phase73_verify_proof "$proof_id" "$verify_file"

  jq -e '.rule_id == "FATF_REC10"' "$detail_file" >/dev/null
  jq -e '.proof_blob.cdd_check_executed == true' "$detail_file" >/dev/null
  jq -e '.proof_blob.sender_screening_performed == true' "$detail_file" >/dev/null
  jq -e '.proof_blob.receiver_screening_performed == true' "$detail_file" >/dev/null

  jq -e '.[] | select(.event_type == "sender_screening_completed")' \
    "$EVIDENCE_DIR/${TX_ID}_regulator_audit.json" >/dev/null

  jq -e '.[] | select(.event_type == "receiver_screening_completed")' \
    "$EVIDENCE_DIR/${TX_ID}_regulator_audit.json" >/dev/null

  if grep -q "Phase 73 Synthetic Sender\|Phase 73 Synthetic Receiver" "$detail_file"; then
    echo "R.10 proof detail leaked raw synthetic customer names"
    exit 1
  fi

  echo "R.10 Customer Due Diligence validation PASSED"
} | tee "$OUT"
