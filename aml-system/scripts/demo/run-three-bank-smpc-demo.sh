#!/usr/bin/env bash
set -euo pipefail

API_BASE="${SMPC_BASE:-http://127.0.0.1:8083}"
EVIDENCE_DIR="tests/evidence/three_bank_smpc"
RESULT_JSON="$EVIDENCE_DIR/three_bank_smpc_result.json"
RESULT_MD="$EVIDENCE_DIR/THREE_BANK_SMPC_EVIDENCE_SUMMARY.md"

mkdir -p "$EVIDENCE_DIR"

echo "============================================================"
echo "BANK-1 THREE-BANK SMPC COLLABORATION DEMO"
echo "============================================================"

curl -fsS "$API_BASE/health" >/dev/null
curl -fsS "$API_BASE/smpc/status" >/dev/null

TX_ID="TX-BANK1-$(date -u +%Y%m%d%H%M%S)"

curl -fsS -X POST "$API_BASE/smpc/three-bank-screen" \
  -H "Content-Type: application/json" \
  -d "{
    \"tx_id\": \"$TX_ID\",
    \"transaction_amount\": 750000,
    \"currency\": \"USD\",
    \"originator_institution\": \"Bank A Uganda\",
    \"beneficiary_institution\": \"Bank B Kenya\",
    \"regulator_reference_set_commitment\": \"REGULATOR-SANCTIONS-COMMITMENT-2026-Q2\",
    \"parties\": [
      {
        \"bank_id\": \"bank_a\",
        \"institution_name\": \"Bank A Uganda\",
        \"private_customer_refs\": [\"cust_hash_a_001\", \"cust_hash_a_002\"],
        \"private_counterparty_refs\": [\"shared_counterparty_hash_777\"],
        \"encrypted_risk_scores\": [42, 51]
      },
      {
        \"bank_id\": \"bank_b\",
        \"institution_name\": \"Bank B Kenya\",
        \"private_customer_refs\": [\"cust_hash_b_001\"],
        \"private_counterparty_refs\": [\"shared_counterparty_hash_777\", \"counterparty_hash_b_002\"],
        \"encrypted_risk_scores\": [64, 57]
      },
      {
        \"bank_id\": \"bank_c\",
        \"institution_name\": \"Bank C Tanzania\",
        \"private_customer_refs\": [\"cust_hash_c_001\"],
        \"private_counterparty_refs\": [\"counterparty_hash_c_002\"],
        \"encrypted_risk_scores\": [38, 44]
      }
    ]
  }" | tee "$RESULT_JSON" | jq .

PARTY_COUNT="$(jq -r '.party_count' "$RESULT_JSON")"
RAW_DISCLOSED="$(jq -r '.raw_bank_inputs_disclosed' "$RESULT_JSON")"
OVERLAP_COUNT="$(jq -r '.possible_cross_bank_overlap_count' "$RESULT_JSON")"
SCREENING_STATUS="$(jq -r '.screening_status' "$RESULT_JSON")"
EXECUTION_MODEL="$(jq -r '.execution_model' "$RESULT_JSON")"

if [ "$PARTY_COUNT" != "3" ]; then
  echo "Expected party_count=3 but got $PARTY_COUNT"
  exit 1
fi

if [ "$RAW_DISCLOSED" != "false" ]; then
  echo "Expected raw_bank_inputs_disclosed=false but got $RAW_DISCLOSED"
  exit 1
fi

if [ "$OVERLAP_COUNT" -lt 1 ]; then
  echo "Expected at least one cross-bank overlap for demo evidence"
  exit 1
fi

cat > "$RESULT_MD" <<RESULTS
# BANK-1 Three-Bank SMPC Collaboration Evidence Summary

## Result

PASSED

## Transaction Tested

\`$TX_ID\`

## Execution Model

\`$EXECUTION_MODEL\`

## Parties

- Bank A Uganda
- Bank B Kenya
- Bank C Tanzania

## Evidence

- Party count: $PARTY_COUNT
- Raw bank inputs disclosed: $RAW_DISCLOSED
- Cross-bank overlap count: $OVERLAP_COUNT
- Screening status: $SCREENING_STATUS

## Research Interpretation

This demonstration confirms that the prototype explicitly supports the research model of a three-bank privacy-preserving AML screening scenario.

The banks act as SMPC participants.

The regulator is not modeled as an SMPC input party in this demo. The regulator remains the verifier of downstream proof and audit evidence.
RESULTS

echo
echo "============================================================"
echo "BANK-1 THREE-BANK SMPC COLLABORATION DEMO PASSED"
echo "Evidence written to:"
echo "$RESULT_JSON"
echo "$RESULT_MD"
echo "============================================================"
