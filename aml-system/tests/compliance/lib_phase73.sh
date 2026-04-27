#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="$ROOT_DIR/tests/evidence/phase7_3"
mkdir -p "$EVIDENCE_DIR"

source "$ROOT_DIR/tests/integration/lib_phase71.sh"

phase73_load() {
  phase71_load_env
  phase71_require_common
  phase71_require_cmd psql
}

phase73_psql_url() {
  phase71_psql_url
}

phase73_clean_tx() {
  local tx_id="$1"
  local psql_url
  psql_url="$(phase73_psql_url)"

  psql "$psql_url" -v ON_ERROR_STOP=1 \
    -c "DELETE FROM proofs WHERE tx_id = '$tx_id';" \
    -c "DELETE FROM audit_logs WHERE tx_id = '$tx_id';" \
    -c "DELETE FROM transactions WHERE tx_id = '$tx_id';"
}

phase73_start_required_services() {
  phase71_start_smpc_runtime
  phase71_start_encryption_service
  phase71_start_zk_prover
  phase71_start_regulator_api
}

phase73_submit_compliance_transaction() {
  local tx_id="$1"
  local payload_file="$EVIDENCE_DIR/${tx_id}_transaction_payload.json"
  local response_file="$EVIDENCE_DIR/${tx_id}_transaction_submit_response.json"
  local encryption_url="${ENCRYPTION_SERVICE_BASE_URL:-http://127.0.0.1:8081}"

  cat > "$payload_file" <<JSON
{
  "tx_id": "$tx_id",
  "sender_id": "PHASE73-SENDER-2001",
  "receiver_id": "PHASE73-RECEIVER-2002",
  "sender_entity_id": 2001,
  "receiver_entity_id": 2002,
  "amount": 1250.0,
  "currency": "USD",
  "transaction_type": "wire_transfer",
  "originator_name": "Phase 73 Synthetic Sender",
  "beneficiary_name": "Phase 73 Synthetic Receiver",
  "originator_institution": "Phase73 Origin Bank",
  "beneficiary_institution": "Phase73 Beneficiary Bank",
  "timestamp": "2026-04-27T09:00:00Z"
}
JSON

  curl -fsS \
    -X POST "$encryption_url/transactions/submit" \
    -H "Content-Type: application/json" \
    -d @"$payload_file" \
    | tee "$response_file" >/dev/null

  jq -e --arg tx_id "$tx_id" '.tx_id == $tx_id' "$response_file" >/dev/null
  jq -e '.status == "screened_clear" or .status == "screened_match"' "$response_file" >/dev/null
}

phase73_generate_proofs() {
  local tx_id="$1"
  local zk_url="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
  local response_file="$EVIDENCE_DIR/${tx_id}_proof_generation_response.json"

  curl -fsS \
    -X POST "$zk_url/proofs/generate" \
    -H "Content-Type: application/json" \
    -d "{\"tx_id\":\"$tx_id\"}" \
    | tee "$response_file" >/dev/null

  jq -e 'length >= 3' "$response_file" >/dev/null
}

phase73_regulator_proofs() {
  local tx_id="$1"
  local regulator_url="${REGULATOR_API_BASE_URL:-http://127.0.0.1:8085}"
  local response_file="$EVIDENCE_DIR/${tx_id}_regulator_proofs.json"

  curl -fsS "$regulator_url/proofs?tx_id=$tx_id" \
    | tee "$response_file" >/dev/null

  jq -e 'length >= 3' "$response_file" >/dev/null
}

phase73_regulator_audit() {
  local tx_id="$1"
  local regulator_url="${REGULATOR_API_BASE_URL:-http://127.0.0.1:8085}"
  local response_file="$EVIDENCE_DIR/${tx_id}_regulator_audit.json"

  curl -fsS "$regulator_url/audit/$tx_id" \
    | tee "$response_file" >/dev/null

  jq -e 'length >= 3' "$response_file" >/dev/null
}

phase73_get_proof_id() {
  local tx_id="$1"
  local recommendation="$2"
  local proofs_file="$EVIDENCE_DIR/${tx_id}_regulator_proofs.json"

  jq -r --arg recommendation "$recommendation" \
    '.[] | select(.rule_id == $recommendation) | .id' \
    "$proofs_file" | head -1
}

phase73_get_proof_detail() {
  local proof_id="$1"
  local output_file="$2"
  local regulator_url="${REGULATOR_API_BASE_URL:-http://127.0.0.1:8085}"

  curl -fsS "$regulator_url/proofs/$proof_id" \
    | tee "$output_file" >/dev/null
}

phase73_verify_proof() {
  local proof_id="$1"
  local output_file="$2"
  local regulator_url="${REGULATOR_API_BASE_URL:-http://127.0.0.1:8085}"

  curl -fsS \
    -X POST "$regulator_url/proofs/$proof_id/verify" \
    | tee "$output_file" >/dev/null

  jq -e '.verified == true' "$output_file" >/dev/null
}

phase73_prepare_full_evidence_flow() {
  local tx_id="$1"

  phase73_load
  phase73_clean_tx "$tx_id"
  phase73_start_required_services
  phase73_submit_compliance_transaction "$tx_id"
  phase73_generate_proofs "$tx_id"
  phase73_regulator_proofs "$tx_id"
  phase73_regulator_audit "$tx_id"
}
