#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SEAL_BUILD_DIR="$ROOT_DIR/services/he-orchestrator/seal-core/build"
SEAL_LIB_DIR="$SEAL_BUILD_DIR"

ENC_MANIFEST="$ROOT_DIR/services/encryption-service/api/Cargo.toml"
HE_MANIFEST="$ROOT_DIR/services/he-orchestrator/rust-gateway/Cargo.toml"
SMPC_MANIFEST="$ROOT_DIR/services/smpc-orchestrator/runtime/Cargo.toml"
ZK_MANIFEST="$ROOT_DIR/services/zk-prover/prover/Cargo.toml"

ENC_URL="http://127.0.0.1:8081"
HE_URL="http://127.0.0.1:8082"
SMPC_URL="http://127.0.0.1:8083"
ZK_URL="http://127.0.0.1:8084"

export DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5433/aml_dev}"
export PSEUDO_SALT="${PSEUDO_SALT:-dev_demo_salt_change_me}"
export SMPC_BASE_URL="${SMPC_BASE_URL:-http://127.0.0.1:8083}"

ENC_PID=""
HE_PID=""
SMPC_PID=""
ZK_PID=""

cleanup() {
  echo
  echo "[cleanup] stopping background services..."
  [[ -n "${ZK_PID}" ]] && kill "${ZK_PID}" 2>/dev/null || true
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

echo "[1/8] checking requirements..."
require_cmd cmake
require_cmd cargo
require_cmd curl
require_cmd jq
require_cmd fuser
require_cmd psql

echo "[2/8] freeing ports 8081, 8082, 8083, 8084 ..."
fuser -k 8081/tcp 8082/tcp 8083/tcp 8084/tcp 2>/dev/null || true

echo "[3/8] building SEAL bridge..."
rm -rf "$SEAL_BUILD_DIR"
cmake -S "$ROOT_DIR/services/he-orchestrator/seal-core" -B "$SEAL_BUILD_DIR"
cmake --build "$SEAL_BUILD_DIR" -j"$(nproc)"
export LD_LIBRARY_PATH="$SEAL_LIB_DIR:${LD_LIBRARY_PATH:-}"

echo "[4/8] starting encryption service..."
cargo run --manifest-path "$ENC_MANIFEST" >/tmp/aml-enc.log 2>&1 &
ENC_PID=$!
sleep 2

echo "[5/8] starting HE gateway..."
cargo run --manifest-path "$HE_MANIFEST" >/tmp/aml-he.log 2>&1 &
HE_PID=$!
sleep 2

echo "[6/8] starting SMPC runtime..."
cargo run --manifest-path "$SMPC_MANIFEST" >/tmp/aml-smpc.log 2>&1 &
SMPC_PID=$!
sleep 2

echo "[7/8] starting zk prover..."
cargo run --manifest-path "$ZK_MANIFEST" >/tmp/aml-zk.log 2>&1 &
ZK_PID=$!
sleep 2

wait_for_post "$ENC_URL/transactions/submit" "encryption-service" 30
wait_for_post "$SMPC_URL/smpc/screen" "smpc-runtime" 30
wait_for_post "$ZK_URL/proofs/generate" "zk-prover" 30

echo "[8/8] submitting transaction and generating proofs..."
TX_ID="TX-P4-$(date +%s)"

TX_RESPONSE="$(curl -fsS -X POST "$ENC_URL/transactions/submit" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg tx_id "$TX_ID" \
    --arg sender_id "ACC-001" \
    --arg receiver_id "ACC-002" \
    --arg currency "USD" \
    --arg transaction_type "wire_transfer" \
    --arg originator_name "Alice" \
    --arg beneficiary_name "Bob" \
    --arg originator_institution "Bank A" \
    --arg beneficiary_institution "Bank B" \
    --arg timestamp "2026-03-12T10:00:00Z" \
    --argjson sender_entity_id 1001 \
    --argjson receiver_entity_id 1002 \
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

echo "[transaction]"
echo "$TX_RESPONSE" | jq .

PROOFS_RESPONSE="$(curl -fsS -X POST "$ZK_URL/proofs/generate" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg tx_id "$TX_ID" '{tx_id: $tx_id}')" )"

echo "[proofs generated]"
echo "$PROOFS_RESPONSE" | jq .

PROOF_COUNT="$(echo "$PROOFS_RESPONSE" | jq 'length')"
[[ "$PROOF_COUNT" == "3" ]] || { echo "[error] expected 3 proofs"; exit 1; }

FIRST_PROOF_ID="$(echo "$PROOFS_RESPONSE" | jq -r '.[0].id')"
VERIFY_RESPONSE="$(curl -fsS -X POST "$ZK_URL/proofs/${FIRST_PROOF_ID}/verify")"

echo "[verification]"
echo "$VERIFY_RESPONSE" | jq .

VERIFIED="$(echo "$VERIFY_RESPONSE" | jq -r '.verified')"
[[ "$VERIFIED" == "true" ]] || { echo "[error] expected verifier to return true"; exit 1; }

DB_PROOF_COUNT="$(db_query "SELECT COUNT(*) FROM proofs WHERE tx_id = '${TX_ID}';")"
echo "[db] proof rows: $DB_PROOF_COUNT"
[[ "$DB_PROOF_COUNT" == "3" ]] || { echo "[error] expected 3 proof rows in DB"; exit 1; }

echo
echo "[done] Phase 4 demo completed successfully."
echo "[ok] transaction processed"
echo "[ok] proof generated"
echo "[ok] regulator can verify proof"
echo "[ok] raw transaction not exposed in proof artifact"
echo "[logs] encryption-service: /tmp/aml-enc.log"
echo "[logs] he-gateway:         /tmp/aml-he.log"
echo "[logs] smpc-runtime:       /tmp/aml-smpc.log"
echo "[logs] zk-prover:          /tmp/aml-zk.log"
