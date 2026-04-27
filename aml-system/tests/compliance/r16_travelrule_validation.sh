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

  psql "$psql_url" -t -A -F ',' -c "
    SELECT tx_id, originator_institution, beneficiary_institution, transaction_type, currency
    FROM transactions
    WHERE tx_id = '$TX_ID';
  " | python3 - "$metadata_file" <<'PY'
import json
import sys

out = sys.argv[1]
raw = sys.stdin.read().strip()

if not raw:
    raise SystemExit("No transaction metadata returned")

parts = raw.split(",", 4)

if len(parts) != 5:
    raise SystemExit(f"Unexpected metadata row format: {raw}")

payload = {
    "tx_id": parts[0],
    "originator_institution": parts[1],
    "beneficiary_institution": parts[2],
    "transaction_type": parts[3],
    "currency": parts[4],
}

with open(out, "w", encoding="utf-8") as f:
    json.dump(payload, f, indent=2)
    f.write("\n")
PY

  jq -e '.originator_institution | length > 0' "$metadata_file" >/dev/null
  jq -e '.beneficiary_institution | length > 0' "$metadata_file" >/dev/null
  jq -e '.transaction_type | length > 0' "$metadata_file" >/dev/null
  jq -e '.currency | length > 0' "$metadata_file" >/dev/null

  proof_id="$(phase73_get_proof_id "$TX_ID" "FATF_REC16")"
  test -n "$proof_id"
  test "$proof_id" != "null"

  detail_file="$EVIDENCE_DIR/${TX_ID}_r16_proof_detail.json"
  verify_file="$EVIDENCE_DIR/${TX_ID}_r16_verify_response.json"

  phase73_get_proof_detail "$proof_id" "$detail_file"
  phase73_verify_proof "$proof_id" "$verify_file"

  jq -e '.rule_id == "FATF_REC16"' "$detail_file" >/dev/null
  jq -e '.proof_blob.originator_institution_present == true' "$detail_file" >/dev/null
  jq -e '.proof_blob.beneficiary_institution_present == true' "$detail_file" >/dev/null
  jq -e '.proof_blob.payment_metadata_present == true' "$detail_file" >/dev/null

  if grep -q "Phase73 Origin Bank\|Phase73 Beneficiary Bank" "$detail_file"; then
    echo "R.16 proof detail leaked raw institution names"
    exit 1
  fi

  echo "R.16 Payment Transparency / Travel Rule validation PASSED"
} | tee "$OUT"
