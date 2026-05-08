#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://127.0.0.1:8085}"
PASSWORD="${PASSWORD:-StrongPass123}"

echo "============================================================"
echo "STAGE 9C — REGULATOR ANOMALY CASE FLOW VALIDATION"
echo "============================================================"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "❌ Missing required command: $1"
    exit 1
  }
}

require_cmd curl
require_cmd jq
require_cmd psql

if [ ! -f .env ]; then
  echo "❌ Run from aml-system root where .env exists."
  exit 1
fi

export DATABASE_URL="$(grep '^DATABASE_URL=' .env | cut -d= -f2-)"

echo
echo "=== Login users ==="
SUBMITTER_JSON="$(curl -fsS -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo.submitter@example.com\",\"password\":\"$PASSWORD\"}")"

REVIEWER_JSON="$(curl -fsS -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo.reviewer@example.com\",\"password\":\"$PASSWORD\"}")"

REGULATOR_JSON="$(curl -fsS -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo.regulator@example.com\",\"password\":\"$PASSWORD\"}")"

AUDITOR_JSON="$(curl -fsS -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo.auditor@example.com\",\"password\":\"$PASSWORD\"}")"

SUBMITTER_TOKEN="$(echo "$SUBMITTER_JSON" | jq -r '.token')"
REVIEWER_TOKEN="$(echo "$REVIEWER_JSON" | jq -r '.token')"
REGULATOR_TOKEN="$(echo "$REGULATOR_JSON" | jq -r '.token')"
AUDITOR_TOKEN="$(echo "$AUDITOR_JSON" | jq -r '.token')"
REVIEWER_ORG_ID="$(echo "$REVIEWER_JSON" | jq -r '.organization_id')"

TX_ID="TX-STAGE9-CASE-$(date +%Y%m%d%H%M%S)"

echo
echo "=== Create suspicious transaction ==="
curl -fsS -X POST "$API_BASE/transactions" \
  -H "Authorization: Bearer $SUBMITTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tx_id\": \"$TX_ID\",
    \"sender_id\": \"SENDER-$TX_ID\",
    \"receiver_id\": \"RECEIVER-$TX_ID\",
    \"sender_entity_id\": 1001,
    \"receiver_entity_id\": 2002,
    \"sender_pseudo\": \"bank_a_customer_hash_001\",
    \"receiver_pseudo\": \"shared_counterparty_hash_777\",
    \"amount\": 250000,
    \"amount_cipher_ref\": \"cipher_amount_250000_demo\",
    \"currency\": \"USD\",
    \"transaction_type\": \"cross_border_wire_transfer\",
    \"originator_name\": \"Demo Originator Customer\",
    \"beneficiary_name\": \"Demo Beneficiary Customer\",
    \"originator_institution\": \"Bank A Uganda\",
    \"beneficiary_institution\": \"Bank B Kenya\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"possible_cross_bank_overlap_count\": 1,
    \"screening_indicator\": \"watchlist_attention\"
  }" | jq '{tx_id,status}'

curl -fsS -X POST "$API_BASE/transactions/$TX_ID/approve" \
  -H "Authorization: Bearer $REVIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note":"Reviewer approved transaction for SMPC screening."}' \
  | jq '{tx_id,status}'

curl -fsS -X POST "$API_BASE/transactions/$TX_ID/run-screening" \
  -H "Authorization: Bearer $REVIEWER_TOKEN" \
  | jq '{workflow_status: .workflow.status, risk_update: .risk_update}'

echo
echo "=== Regulator opens anomaly case ==="
CASE_JSON="$(curl -fsS -X POST "$API_BASE/regulator/anomaly-cases" \
  -H "Authorization: Bearer $REGULATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"tx_id\": \"$TX_ID\",
    \"summary\": \"SMPC-linked suspicious transaction requires partner bank follow-up.\",
    \"regulator_finding\": \"Aggregate evidence shows cross-bank overlap and screening attention without exposing raw bank inputs.\",
    \"required_bank_action\": \"Review the transaction, confirm internal investigation status, and respond to the regulator notice.\",
    \"notified_organization_ids\": [\"$REVIEWER_ORG_ID\"]
  }")"

echo "$CASE_JSON" | jq '{id, case_ref, tx_id, case_status, risk_level, bank_notices}'

CASE_ID="$(echo "$CASE_JSON" | jq -r '.id')"
CASE_REF="$(echo "$CASE_JSON" | jq -r '.case_ref')"

test "$CASE_ID" != "null"
test -n "$CASE_ID"

echo "✅ regulator can open anomaly case"

echo
echo "=== Auditor can read case ==="
curl -fsS "$API_BASE/regulator/anomaly-cases/$CASE_ID" \
  -H "Authorization: Bearer $AUDITOR_TOKEN" \
  | jq '{case_ref, tx_id, case_status, risk_level}'

echo "✅ auditor can read case"

echo
echo "=== Auditor cannot update/close case ==="
AUDITOR_CLOSE="$(curl -sS -w '\nHTTP_STATUS=%{http_code}\n' -X POST "$API_BASE/regulator/anomaly-cases/$CASE_ID/close" \
  -H "Authorization: Bearer $AUDITOR_TOKEN")"

echo "$AUDITOR_CLOSE"
echo "$AUDITOR_CLOSE" | grep -q "HTTP_STATUS=403"

echo "✅ auditor cannot update case"

echo
echo "=== Bank can see notice ==="
NOTICE_JSON="$(curl -fsS "$API_BASE/institution/anomaly-notices" \
  -H "Authorization: Bearer $REVIEWER_TOKEN" \
  | jq '.[] | select(.case_id=="'"$CASE_ID"'")')"

echo "$NOTICE_JSON" | jq '{
  case_ref,
  tx_id,
  notice_status,
  risk_level,
  aggregate_evidence_summary
}'

echo "$NOTICE_JSON" | jq -e '.aggregate_evidence_summary.raw_bank_inputs_exposed == false' >/dev/null

echo "✅ bank can see notice"
echo "✅ raw bank data is not exposed"

echo
echo "=== Bank can respond to notice ==="
curl -fsS -X POST "$API_BASE/institution/anomaly-notices/$CASE_ID/respond" \
  -H "Authorization: Bearer $REVIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bank_response": "Bank reviewer confirms the anomaly notice was received and internal investigation has started."
  }' | jq '{case_ref, notice_status, bank_response}'

echo "✅ bank can respond to notice"

echo
echo "=== Submitter cannot read notices ==="
SUBMITTER_NOTICE="$(curl -sS -w '\nHTTP_STATUS=%{http_code}\n' "$API_BASE/institution/anomaly-notices" \
  -H "Authorization: Bearer $SUBMITTER_TOKEN")"

echo "$SUBMITTER_NOTICE"
echo "$SUBMITTER_NOTICE" | grep -q "HTTP_STATUS=403"

echo "✅ submitter cannot read anomaly notices"

echo
echo "============================================================"
echo "REGULATOR ANOMALY CASE FLOW VALIDATION PASSED"
echo "TX_ID=$TX_ID"
echo "CASE_ID=$CASE_ID"
echo "CASE_REF=$CASE_REF"
echo "============================================================"
