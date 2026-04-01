#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SEAL_BUILD_DIR="$ROOT_DIR/services/he-orchestrator/seal-core/build"
SEAL_LIB_DIR="$SEAL_BUILD_DIR"

ENC_MANIFEST="$ROOT_DIR/services/encryption-service/api/Cargo.toml"
HE_MANIFEST="$ROOT_DIR/services/he-orchestrator/rust-gateway/Cargo.toml"
SMPC_MANIFEST="$ROOT_DIR/services/smpc-orchestrator/runtime/Cargo.toml"

ENC_URL="http://127.0.0.1:8081"
HE_URL="http://127.0.0.1:8082"
SMPC_URL="http://127.0.0.1:8083"

export DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5434/aml_dev}"
export PSEUDO_SALT="${PSEUDO_SALT:-dev_demo_salt_change_me}"
export SMPC_BASE_URL="${SMPC_BASE_URL:-http://127.0.0.1:8083}"
export AML_ROOT_DIR="$ROOT_DIR"

ENC_PID=""
HE_PID=""
SMPC_PID=""

cleanup() {
  echo
  echo "[cleanup] stopping background services..."
  [[ -n "${SMPC_PID}" ]] && kill "${SMPC_PID}" 2>/dev/null || true
  [[ -n "${HE_PID}" ]] && kill "${HE_PID}" 2>/dev/null || true
  [[ -n "${ENC_PID}" ]] && kill "${ENC_PID}" 2>/dev/null || true
}
trap cleanup EXIT

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "[error] missing required command: $1"
    exit 1
  }
}

wait_for_post() {
  local url="$1"
  local name="$2"
  local retries="${3:-30}"

  echo "[wait] waiting for ${name} at ${url} ..."
  for ((i=1; i<=retries; i++)); do
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -Eq "^(200|404|405)$"; then
      echo "[ok] ${name} is reachable"
      return 0
    fi
    sleep 1
  done

  echo "[error] ${name} did not become reachable: ${url}"
  return 1
}

db_query() {
  psql "$DATABASE_URL" -Atqc "$1"
}

echo "[1/7] checking requirements..."
require_cmd cmake
require_cmd cargo
require_cmd curl
require_cmd jq
require_cmd fuser
require_cmd psql
require_cmd bash

echo "[2/7] freeing ports 8081, 8082, 8083 ..."
fuser -k 8081/tcp 8082/tcp 8083/tcp 2>/dev/null || true

echo "[3/7] building SEAL bridge..."
rm -rf "$SEAL_BUILD_DIR"
cmake -S "$ROOT_DIR/services/he-orchestrator/seal-core" -B "$SEAL_BUILD_DIR"
cmake --build "$SEAL_BUILD_DIR" -j"$(nproc)"
export LD_LIBRARY_PATH="$SEAL_LIB_DIR:${LD_LIBRARY_PATH:-}"

echo "[4/7] starting encryption service..."
cargo run --manifest-path "$ENC_MANIFEST" >/tmp/aml-enc.log 2>&1 &
ENC_PID=$!
sleep 2

echo "[5/7] starting HE gateway..."
cargo run --manifest-path "$HE_MANIFEST" >/tmp/aml-he.log 2>&1 &
HE_PID=$!
sleep 2

echo "[6/7] starting SMPC runtime..."
cargo run --manifest-path "$SMPC_MANIFEST" >/tmp/aml-smpc.log 2>&1 &
SMPC_PID=$!
sleep 2

wait_for_post "$ENC_URL/transactions/submit" "encryption-service" 30
wait_for_post "$HE_URL/he/encrypt" "he-gateway" 30
wait_for_post "$SMPC_URL/smpc/screen" "smpc-runtime" 30

echo "[7/7] submitting integrated transaction..."
TX_ID="TX-P3-INT-$(date +%s)"

TX_RESPONSE="$(curl -fsS -X POST "$ENC_URL/transactions/submit" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg tx_id "$TX_ID" \
    --arg sender_id "ACC-007" \
    --arg receiver_id "ACC-001" \
    --arg currency "USD" \
    --arg transaction_type "wire_transfer" \
    --arg originator_name "Alice" \
    --arg beneficiary_name "Bob" \
    --arg originator_institution "Bank A" \
    --arg beneficiary_institution "Bank B" \
    --arg timestamp "2026-03-12T10:00:00Z" \
    --argjson sender_entity_id 1007 \
    --argjson receiver_entity_id 1001 \
    --argjson amount 1250.50 \
    '{
      tx_id: $tx_id,
      sender_id: $sender_id,
      receiver_id: $receiver_id,
      sender_entity_id: $sender_entity_id,
      receiver_entity_id: $receiver_entity_id,
      amount: $amount,
      currency: $currency,
      transaction_type: $transaction_type,
      originator_name: $originator_name,
      beneficiary_name: $beneficiary_name,
      originator_institution: $originator_institution,
      beneficiary_institution: $beneficiary_institution,
      timestamp: $timestamp
    }')" )"

echo "[transaction response]"
echo "$TX_RESPONSE" | jq .

SENDER_RESULT="$(echo "$TX_RESPONSE" | jq -r '.sender_screening_result')"
RECEIVER_RESULT="$(echo "$TX_RESPONSE" | jq -r '.receiver_screening_result')"
STATUS_RESULT="$(echo "$TX_RESPONSE" | jq -r '.status')"

[[ "$SENDER_RESULT" == "match" ]] || { echo "[error] expected sender match"; exit 1; }
[[ "$RECEIVER_RESULT" == "no_match" ]] || { echo "[error] expected receiver no_match"; exit 1; }
[[ "$STATUS_RESULT" == "screened_match" ]] || { echo "[error] expected status screened_match"; exit 1; }

echo "[db checks]"
TX_COUNT="$(db_query "SELECT COUNT(*) FROM transactions WHERE tx_id = '${TX_ID}';")"
AUDIT_COUNT="$(db_query "SELECT COUNT(*) FROM audit_logs WHERE tx_id = '${TX_ID}';")"

echo "transaction rows: $TX_COUNT"
echo "audit rows:       $AUDIT_COUNT"

[[ "$TX_COUNT" == "1" ]] || { echo "[error] expected exactly 1 transaction row"; exit 1; }
[[ "$AUDIT_COUNT" =~ ^[1-9][0-9]*$ ]] || { echo "[error] expected audit rows"; exit 1; }

echo
echo "[done] Phase 3 integrated demo completed successfully."
echo "[logs] encryption-service: /tmp/aml-enc.log"
echo "[logs] he-gateway:         /tmp/aml-he.log"
echo "[logs] smpc-runtime:       /tmp/aml-smpc.log"