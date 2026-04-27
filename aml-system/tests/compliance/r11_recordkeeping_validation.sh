#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib_phase73.sh"

TX_ID="${1:-TX-PHASE73-R11-001}"
OUT="$EVIDENCE_DIR/${TX_ID}_r11_recordkeeping_validation.log"

{
  echo "Running Phase 7.3 R.11 Record Keeping validation for $TX_ID"

  phase73_prepare_full_evidence_flow "$TX_ID"

  psql_url="$(phase73_psql_url)"
  summary_file="$EVIDENCE_DIR/${TX_ID}_db_recordkeeping_summary.json"

  transaction_count="$(psql "$psql_url" -t -A -c "SELECT COUNT(*) FROM transactions WHERE tx_id = '$TX_ID';")"
  audit_count="$(psql "$psql_url" -t -A -c "SELECT COUNT(*) FROM audit_logs WHERE tx_id = '$TX_ID';")"
  proof_count="$(psql "$psql_url" -t -A -c "SELECT COUNT(*) FROM proofs WHERE tx_id = '$TX_ID';")"

  cat > "$summary_file" <<JSON
{
  "tx_id": "$TX_ID",
  "transaction_count": $transaction_count,
  "audit_count": $audit_count,
  "proof_count": $proof_count
}
JSON

  jq -e '.transaction_count == 1' "$summary_file" >/dev/null
  jq -e '.audit_count >= 3' "$summary_file" >/dev/null
  jq -e '.proof_count >= 3' "$summary_file" >/dev/null

  jq -e 'length >= 3' "$EVIDENCE_DIR/${TX_ID}_regulator_proofs.json" >/dev/null
  jq -e 'length >= 3' "$EVIDENCE_DIR/${TX_ID}_regulator_audit.json" >/dev/null

  jq -e '.[] | select(.event_type == "transaction_submitted_and_pseudonymized")' \
    "$EVIDENCE_DIR/${TX_ID}_regulator_audit.json" >/dev/null

  jq -e '.[] | select(.event_type == "sender_screening_completed")' \
    "$EVIDENCE_DIR/${TX_ID}_regulator_audit.json" >/dev/null

  jq -e '.[] | select(.event_type == "receiver_screening_completed")' \
    "$EVIDENCE_DIR/${TX_ID}_regulator_audit.json" >/dev/null

  proof_id="$(phase73_get_proof_id "$TX_ID" "FATF_REC11")"
  test -n "$proof_id"
  test "$proof_id" != "null"

  verify_file="$EVIDENCE_DIR/${TX_ID}_r11_verify_response.json"
  phase73_verify_proof "$proof_id" "$verify_file"

  echo "R.11 Record Keeping validation PASSED"
} | tee "$OUT"
