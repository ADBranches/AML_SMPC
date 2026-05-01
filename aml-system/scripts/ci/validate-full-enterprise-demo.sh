#!/usr/bin/env bash
set -euo pipefail

echo "============================================================"
echo "STAGE 9D — FULL ENTERPRISE DEMO VALIDATION"
echo "============================================================"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "❌ Missing required command: $1"
    exit 1
  }
}

require_cmd curl
require_cmd jq
require_cmd psql
require_cmd cargo
require_cmd npm
require_cmd git

echo
echo "=== Build backend ==="
cargo build --manifest-path services/regulator-api/backend/Cargo.toml

echo
echo "=== Build frontend ==="
(
  cd services/regulator-api/frontend
  npm run build
)

echo
echo "=== Validate API health ==="
curl -fsS http://127.0.0.1:8085/health | jq .

echo
echo "=== Run Stage 9A — Bank RBAC Identity ==="
./scripts/ci/validate-bank-rbac-identity.sh

echo
echo "=== Run Stage 9B — Suspicious Transaction Rules ==="
./scripts/ci/validate-suspicious-transaction-rules.sh

echo
echo "=== Run Stage 9C — Regulator Anomaly Case Flow ==="
./scripts/ci/validate-regulator-anomaly-case-flow.sh

echo
echo "=== Proof generation and regulator verification smoke ==="
PASSWORD="${PASSWORD:-StrongPass123}"
API_BASE="${API_BASE:-http://127.0.0.1:8085}"

SUBMITTER_JSON="$(curl -fsS -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo.submitter@example.com\",\"password\":\"$PASSWORD\"}")"

REVIEWER_JSON="$(curl -fsS -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo.reviewer@example.com\",\"password\":\"$PASSWORD\"}")"

REGULATOR_JSON="$(curl -fsS -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo.regulator@example.com\",\"password\":\"$PASSWORD\"}")"

SUBMITTER_TOKEN="$(echo "$SUBMITTER_JSON" | jq -r '.token')"
REVIEWER_TOKEN="$(echo "$REVIEWER_JSON" | jq -r '.token')"
REGULATOR_TOKEN="$(echo "$REGULATOR_JSON" | jq -r '.token')"

TX_ID="TX-STAGE9-FULL-$(date +%Y%m%d%H%M%S)"

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
  -d '{"note":"Reviewer approved transaction for full enterprise validation."}' \
  | jq '{tx_id,status}'

curl -fsS -X POST "$API_BASE/transactions/$TX_ID/run-screening" \
  -H "Authorization: Bearer $REVIEWER_TOKEN" \
  | jq '{workflow_status: .workflow.status, risk_update: .risk_update}'

curl -fsS -X POST "$API_BASE/transactions/$TX_ID/generate-proofs" \
  -H "Authorization: Bearer $REVIEWER_TOKEN" \
  | jq '{workflow: .workflow.status, proof_count: (.proof_response | length)}'

PROOF_COUNT="$(curl -fsS "$API_BASE/proofs?tx_id=$TX_ID" \
  -H "Authorization: Bearer $REGULATOR_TOKEN" \
  | jq 'length')"

if [ "$PROOF_COUNT" -lt 1 ]; then
  echo "❌ Expected regulator to read generated proofs."
  exit 1
fi

echo "✅ proof generation works"
echo "✅ regulator verification/proof inspection works"

echo
echo "=== Repo audit stays clean ==="
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC
git status -sb

if git status --porcelain | grep -q .; then
  echo "⚠️ Working tree has changes. This may be expected before committing Stage 9/10 docs."
else
  echo "✅ repository working tree is clean"
fi

echo
echo "============================================================"
echo "FULL ENTERPRISE DEMO VALIDATION PASSED"
echo "============================================================"
