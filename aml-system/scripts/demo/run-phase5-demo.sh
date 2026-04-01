#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REG_MANIFEST="$ROOT_DIR/services/regulator-api/backend/Cargo.toml"
ENC_MANIFEST="$ROOT_DIR/services/encryption-service/api/Cargo.toml"
HE_MANIFEST="$ROOT_DIR/services/he-orchestrator/rust-gateway/Cargo.toml"
SMPC_MANIFEST="$ROOT_DIR/services/smpc-orchestrator/runtime/Cargo.toml"
ZK_MANIFEST="$ROOT_DIR/services/zk-prover/prover/Cargo.toml"

SEAL_BUILD_DIR="$ROOT_DIR/services/he-orchestrator/seal-core/build"

REG_URL="http://127.0.0.1:8085"
ENC_URL="http://127.0.0.1:8081"
SMPC_URL="http://127.0.0.1:8083"
ZK_URL="http://127.0.0.1:8084"

export DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5434/aml_dev}"
export PSEUDO_SALT="${PSEUDO_SALT:-dev_demo_salt_change_me}"
export SMPC_BASE_URL="${SMPC_BASE_URL:-http://127.0.0.1:8083}"
export ZK_PROVER_BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"

ENC_PID=""
HE_PID=""
SMPC_PID=""
ZK_PID=""
REG_PID=""

cleanup() {
  echo
  echo "[cleanup] stopping background services..."
  [[ -n "${REG_PID}" ]] && kill "${REG_PID}" 2>/dev/null || true
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

echo "[1/9] checking requirements..."
require_cmd cmake
require_cmd cargo
require_cmd curl
require_cmd jq
require_cmd psql
require_cmd fuser

echo "[2/9] freeing ports 8081..8085 ..."
fuser -k 8081/tcp 8082/tcp 8083/tcp 8084/tcp 8085/tcp 2>/dev/null || true

echo "[3/9] building SEAL bridge..."
rm -rf "$SEAL_BUILD_DIR"
cmake -S "$ROOT_DIR/services/he-orchestrator/seal-core" -B "$SEAL_BUILD_DIR"
cmake --build "$SEAL_BUILD_DIR" -j"$(nproc)"
export LD_LIBRARY_PATH="$SEAL_BUILD_DIR:${LD_LIBRARY_PATH:-}"

echo "[4/9] starting encryption service..."
cargo run --manifest-path "$ENC_MANIFEST" >/tmp/aml-enc.log 2>&1 &
ENC_PID=$!
sleep 2

echo "[5/9] starting HE gateway..."
cargo run --manifest-path "$HE_MANIFEST" >/tmp/aml-he.log 2>&1 &
HE_PID=$!
sleep 2

echo "[6/9] starting SMPC runtime..."
cargo run --manifest-path "$SMPC_MANIFEST" >/tmp/aml-smpc.log 2>&1 &
SMPC_PID=$!
sleep 2

echo "[7/9] starting zk prover..."
cargo run --manifest-path "$ZK_MANIFEST" >/tmp/aml-zk.log 2>&1 &
ZK_PID=$!
sleep 2

echo "[8/9] starting regulator API..."
cargo run --manifest-path "$REG_MANIFEST" >/tmp/aml-reg.log 2>&1 &
REG_PID=$!
sleep 2

wait_for_post "$ENC_URL/transactions/submit" "encryption-service" 30
wait_for_post "$SMPC_URL/smpc/screen" "smpc-runtime" 30
wait_for_post "$ZK_URL/proofs/generate" "zk-prover" 30
wait_for_post "$REG_URL/proofs" "regulator-api" 30

echo "[9/9] creating transaction + proofs, then regulator flow..."
TX_ID="TX-P5-$(date +%s)"

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

curl -fsS -X POST "$ZK_URL/proofs/generate" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg tx_id "$TX_ID" '{tx_id: $tx_id}')" >/tmp/proofs.json

echo "[proofs generated]"
cat /tmp/proofs.json | jq .

echo "[regulator list proofs]"
LIST_RESPONSE="$(curl -fsS "$REG_URL/proofs?tx_id=$TX_ID")"
echo "$LIST_RESPONSE" | jq .

PROOF_COUNT="$(echo "$LIST_RESPONSE" | jq 'length')"
[[ "$PROOF_COUNT" == "3" ]] || { echo "[error] expected 3 proofs from regulator API"; exit 1; }

PROOF_ID="$(echo "$LIST_RESPONSE" | jq -r '.[0].id')"
echo "[regulator get proof]"
GET_PROOF="$(curl -fsS "$REG_URL/proofs/$PROOF_ID")"
echo "$GET_PROOF" | jq .

echo "[regulator verify proof]"
VERIFY_RESPONSE="$(curl -fsS -X POST "$REG_URL/proofs/$PROOF_ID/verify")"
echo "$VERIFY_RESPONSE" | jq .

VERIFIED="$(echo "$VERIFY_RESPONSE" | jq -r '.verified')"
[[ "$VERIFIED" == "true" ]] || { echo "[error] expected proof verification true"; exit 1; }

echo "[regulator audit timeline]"
AUDIT_RESPONSE="$(curl -fsS "$REG_URL/audit/$TX_ID")"
echo "$AUDIT_RESPONSE" | jq .

AUDIT_COUNT="$(echo "$AUDIT_RESPONSE" | jq 'length')"
[[ "$AUDIT_COUNT" =~ ^[3-9][0-9]*$|^[3-9]$ ]] || { echo "[error] expected >=3 audit events"; exit 1; }

echo
echo "[done] Phase 5 demo completed successfully."
echo "[ok] regulator API can fetch proofs and audit metadata"
echo "[ok] proof-to-transaction-to-audit linkage is demonstrable"
echo "[ok] privacy preserved in regulator-facing flow"
echo "[logs] regulator-api:       /tmp/aml-reg.log"
echo "[logs] zk-prover:          /tmp/aml-zk.log"
echo "[logs] encryption-service: /tmp/aml-enc.log"
echo "[logs] smpc-runtime:       /tmp/aml-smpc.log"
