#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib_phase73.sh"

TX_ID="${1:-TX-PHASE73-R16-001}"
OUT="$EVIDENCE_DIR/${TX_ID}_r16_travelrule_validation.log"

{
  echo "Running Phase 7.3 R.16 Payment Transparency / Travel Rule validation for $TX_ID"

  phase73_prepare_full_evidence_flow "$TX_ID"

  psql_url="$(phase73_psql_url)"
  metadata_file="$EVIDENCE_DIR/${TX_ID}_transaction_metadata.json"

  echo "Extracting R.16 transaction metadata..."

  metadata_raw="$(psql "$psql_url" -t -A -F "|" -v ON_ERROR_STOP=1 -c "SELECT tx_id, originator_institution, beneficiary_institution, transaction_type, currency FROM transactions WHERE tx_id = \$\$${TX_ID}\$\$ LIMIT 1;")"

  if [ -z "${metadata_raw//[[:space:]]/}" ]; then
    echo "No transaction metadata returned for $TX_ID"
    echo "Debugging available Phase 7.3 R.16 transaction rows..."
    psql "$psql_url" -v ON_ERROR_STOP=1 -c "SELECT tx_id, status, created_at FROM transactions WHERE tx_id LIKE \$\$TX-PHASE73-R16%\$\$ ORDER BY created_at DESC LIMIT 10;"
    exit 1
  fi

  IFS="|" read -r meta_tx_id originator_institution beneficiary_institution transaction_type currency <<< "$metadata_raw"

  jq -n \
    --arg tx_id "$meta_tx_id" \
    --arg originator_institution "$originator_institution" \
    --arg beneficiary_institution "$beneficiary_institution" \
    --arg transaction_type "$transaction_type" \
    --arg currency "$currency" \
    "{tx_id:\$tx_id, originator_institution:\$originator_institution, beneficiary_institution:\$beneficiary_institution, transaction_type:\$transaction_type, currency:\$currency}" \
    > "$metadata_file"

  jq -e ".originator_institution | length > 0" "$metadata_file" >/dev/null
  jq -e ".beneficiary_institution | length > 0" "$metadata_file" >/dev/null
  jq -e ".transaction_type | length > 0" "$metadata_file" >/dev/null
  jq -e ".currency | length > 0" "$metadata_file" >/dev/null

  proof_id="$(phase73_get_proof_id "$TX_ID" "FATF_REC16")"
  test -n "$proof_id"
  test "$proof_id" != "null"

  detail_file="$EVIDENCE_DIR/${TX_ID}_r16_proof_detail.json"
  verify_file="$EVIDENCE_DIR/${TX_ID}_r16_verify_response.json"
  summary_file="$EVIDENCE_DIR/${TX_ID}_r16_summary.txt"

  phase73_get_proof_detail "$proof_id" "$detail_file"
  phase73_verify_proof "$proof_id" "$verify_file"

  jq -e ".rule_id == \"FATF_REC16\"" "$detail_file" >/dev/null
  jq -e ".proof_blob.originator_institution_present == true" "$detail_file" >/dev/null
  jq -e ".proof_blob.beneficiary_institution_present == true" "$detail_file" >/dev/null
  jq -e ".proof_blob.payment_metadata_present == true" "$detail_file" >/dev/null
  jq -e ".verified == true" "$verify_file" >/dev/null

  if grep -q "Phase73 Origin Bank\|Phase73 Beneficiary Bank" "$detail_file"; then
    echo "R.16 proof detail leaked raw institution names"
    exit 1
  fi

  printf "Phase 7.3 R.16 Travel Rule validation passed.\nTransaction: %s\nProof ID: %s\nEvidence directory: %s\n" "$TX_ID" "$proof_id" "$EVIDENCE_DIR" > "$summary_file"

  echo "R.16 Payment Transparency / Travel Rule validation PASSED"
  echo "Evidence written to: $EVIDENCE_DIR"
} | tee "$OUT"
