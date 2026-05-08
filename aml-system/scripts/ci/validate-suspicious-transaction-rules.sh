#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://127.0.0.1:8085}"
PASSWORD="${PASSWORD:-StrongPass123}"

echo "============================================================"
echo "STAGE 9B — SUSPICIOUS TRANSACTION RULES VALIDATION"
echo "============================================================"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "❌ Missing required command: $1"
    exit 1
  }
}

require_cmd curl
require_cmd jq

echo
echo "=== Login users ==="
SUBMITTER_JSON="$(curl -fsS -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"demo.submitter@example.com\",
    \"password\": \"$PASSWORD\"
  }")"

REVIEWER_JSON="$(curl -fsS -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"demo.reviewer@example.com\",
    \"password\": \"$PASSWORD\"
  }")"

SUBMITTER_TOKEN="$(echo "$SUBMITTER_JSON" | jq -r '.token')"
REVIEWER_TOKEN="$(echo "$REVIEWER_JSON" | jq -r '.token')"

echo "$SUBMITTER_JSON" | jq '{email, role, organization_id}'
echo "$REVIEWER_JSON" | jq '{email, role, organization_id}'

TX_ID="TX-STAGE9-RISK-$(date +%Y%m%d%H%M%S)"

echo
echo "=== Submit transaction: $TX_ID ==="
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
    \"counterparty_risk\": \"high_risk_counterparty\",
    \"cdd_status\": \"cdd_incomplete\",
    \"screening_indicator\": \"watchlist_attention\",
    \"possible_cross_bank_overlap_count\": 1
  }" | jq '{tx_id,status}'

echo
echo "=== Submitter cannot approve ==="
APPROVE_DENIED="$(curl -sS -w '\nHTTP_STATUS=%{http_code}\n' -X POST "$API_BASE/transactions/$TX_ID/approve" \
  -H "Authorization: Bearer $SUBMITTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note":"Submitter should not approve."}')"

echo "$APPROVE_DENIED"
echo "$APPROVE_DENIED" | grep -q "HTTP_STATUS=403"

echo "✅ submitter cannot approve"

echo
echo "=== Submitter cannot evaluate risk ==="
RISK_DENIED="$(curl -sS -w '\nHTTP_STATUS=%{http_code}\n' -X POST "$API_BASE/transactions/$TX_ID/evaluate-risk" \
  -H "Authorization: Bearer $SUBMITTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"review_notes":"Submitter should not evaluate risk."}')"

echo "$RISK_DENIED"
echo "$RISK_DENIED" | grep -q "HTTP_STATUS=403"

echo "✅ submitter cannot evaluate risk"

echo
echo "=== Reviewer evaluates risk ==="
RISK_JSON="$(curl -fsS -X POST "$API_BASE/transactions/$TX_ID/evaluate-risk" \
  -H "Authorization: Bearer $REVIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"review_notes":"Reviewer executed bank-side AML risk evaluation before regulator verification."}')"

echo "$RISK_JSON" | jq '{
  tx_id,
  risk_score,
  risk_level,
  suspicion_status,
  triggered_rules: [.triggered_rules[].rule_code],
  workflow_risk: {
    risk_score: .workflow.risk_score,
    risk_level: .workflow.risk_level,
    suspicion_status: .workflow.suspicion_status
  }
}'

echo "$RISK_JSON" | jq -e '.risk_score > 0' >/dev/null
echo "$RISK_JSON" | jq -e '.triggered_rules | length > 0' >/dev/null
echo "$RISK_JSON" | jq -e '.suspicion_status == "suspicious" or .suspicion_status == "under_review"' >/dev/null

echo "✅ reviewer can evaluate risk"
echo "✅ risk_score is saved"
echo "✅ triggered_rules are saved"

echo
echo "=== Reviewer can approve ==="
curl -fsS -X POST "$API_BASE/transactions/$TX_ID/approve" \
  -H "Authorization: Bearer $REVIEWER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note":"Reviewer approved risk-evaluated transaction."}' \
  | jq '{tx_id,status,reviewer_email}'

echo
echo "=== Suspicious queue returns record ==="
curl -fsS "$API_BASE/transactions/$TX_ID" \
  -H "Authorization: Bearer $REVIEWER_TOKEN" \
  | jq '{
      tx_id,
      risk_score,
      risk_level,
      suspicion_status,
      triggered_rules,
      recommended_action
    }' | tee /tmp/stage9_suspicious_record.json

jq -e '.risk_score > 0' /tmp/stage9_suspicious_record.json >/dev/null
jq -e '.triggered_rules | length > 0' /tmp/stage9_suspicious_record.json >/dev/null

echo "✅ suspicious transaction record returns saved risk fields"

echo
echo "============================================================"
echo "SUSPICIOUS TRANSACTION RULES VALIDATION PASSED"
echo "TX_ID=$TX_ID"
echo "============================================================"
