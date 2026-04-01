#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SEAL_BUILD_DIR="$ROOT_DIR/services/he-orchestrator/seal-core/build"
SEAL_LIB_DIR="$SEAL_BUILD_DIR"
HE_GATEWAY_MANIFEST="$ROOT_DIR/services/he-orchestrator/rust-gateway/Cargo.toml"
ENC_MANIFEST="$ROOT_DIR/services/encryption-service/api/Cargo.toml"

ENC_URL="http://127.0.0.1:8081"
HE_URL="http://127.0.0.1:8082"

# Ensure the encryption service always has DB access, even in a fresh shell.
export DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5434/aml_dev}"

ENC_PID=""
HE_PID=""

cleanup() {
  echo
  echo "[cleanup] stopping background services..."
  [[ -n "${HE_PID}" ]] && kill "${HE_PID}" 2>/dev/null || true
  [[ -n "${ENC_PID}" ]] && kill "${ENC_PID}" 2>/dev/null || true
}
trap cleanup EXIT

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1"
    exit 1
  }
}

wait_for_http() {
  local url="$1"
  local name="$2"
  local retries="${3:-30}"

  echo "[wait] waiting for ${name} at ${url} ..."
  for ((i=1; i<=retries; i++)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "[ok] ${name} is up"
      return 0
    fi
    sleep 1
  done

  echo "[error] ${name} did not become ready: ${url}"
  return 1
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

echo "[1/6] checking requirements..."
require_cmd cmake
require_cmd cargo
require_cmd curl
require_cmd jq
require_cmd fuser

echo "[2/6] freeing ports 8081 and 8082 if occupied..."
fuser -k 8081/tcp 8082/tcp 2>/dev/null || true

echo "[3/6] building SEAL bridge..."
rm -rf "$SEAL_BUILD_DIR"
cmake -S "$ROOT_DIR/services/he-orchestrator/seal-core" -B "$SEAL_BUILD_DIR"
cmake --build "$SEAL_BUILD_DIR" -j"$(nproc)"

if [[ ! -f "$SEAL_LIB_DIR/libseal_bridge.so" ]]; then
  echo "[error] libseal_bridge.so not found in $SEAL_LIB_DIR"
  exit 1
fi

export LD_LIBRARY_PATH="$SEAL_LIB_DIR:${LD_LIBRARY_PATH:-}"
echo "[ok] LD_LIBRARY_PATH=$LD_LIBRARY_PATH"
echo "[ok] DATABASE_URL=$DATABASE_URL"

echo "[4/6] starting encryption service on :8081 ..."
cargo run --manifest-path "$ENC_MANIFEST" > /tmp/aml-enc.log 2>&1 &
ENC_PID=$!
sleep 2

echo "[5/6] starting HE gateway on :8082 ..."
cargo run --manifest-path "$HE_GATEWAY_MANIFEST" > /tmp/aml-he.log 2>&1 &
HE_PID=$!
sleep 2

wait_for_post "$ENC_URL/transactions/submit" "encryption-service" 30
wait_for_post "$HE_URL/he/encrypt" "he-gateway" 30

echo "[6/6] submitting transaction..."
TX_ID="TX-$(date +%s)"

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
    --argjson amount 1250.50 \
    '{
      tx_id: $tx_id,
      sender_id: $sender_id,
      receiver_id: $receiver_id,
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

echo "[HE flow]"

ENC1_RESPONSE="$(curl -fsS -X POST "$HE_URL/he/encrypt" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100.0}')"

ENC2_RESPONSE="$(curl -fsS -X POST "$HE_URL/he/encrypt" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50.0}')"

echo "[encrypt #1]"
echo "$ENC1_RESPONSE" | jq .
echo "[encrypt #2]"
echo "$ENC2_RESPONSE" | jq .

C1="$(echo "$ENC1_RESPONSE" | jq -r '.ciphertext_hex')"
C2="$(echo "$ENC2_RESPONSE" | jq -r '.ciphertext_hex')"

if [[ -z "$C1" || "$C1" == "null" ]]; then
  echo "[error] failed to extract first ciphertext"
  exit 1
fi

if [[ -z "$C2" || "$C2" == "null" ]]; then
  echo "[error] failed to extract second ciphertext"
  exit 1
fi

SUM_RESPONSE="$(printf '%s\n%s\n' "$C1" "$C2" | jq -Rs '
  split("\n") as $lines
  | {
      lhs_ciphertext_hex: $lines[0],
      rhs_ciphertext_hex: $lines[1]
    }' | curl -fsS -X POST "$HE_URL/he/sum" \
      -H "Content-Type: application/json" \
      --data-binary @-)"

echo "[sum raw]"
printf '%s\n' "$SUM_RESPONSE"
echo "[sum pretty]"
printf '%s\n' "$SUM_RESPONSE" | jq .

SUM_CIPHER="$(printf '%s\n' "$SUM_RESPONSE" | jq -r 'if type == "string" then . else (.result_ciphertext_hex // .ciphertext_hex) end')"

if [[ -z "$SUM_CIPHER" || "$SUM_CIPHER" == "null" ]]; then
  echo "[error] failed to extract summed ciphertext"
  exit 1
fi

DEC_RESPONSE="$(printf '%s' "$SUM_CIPHER" | jq -Rs '
  { ciphertext_hex: . }' | curl -fsS -X POST "$HE_URL/he/decrypt-test" \
      -H "Content-Type: application/json" \
      --data-binary @-)"

echo "[decrypt-test]"
echo "$DEC_RESPONSE" | jq .

echo
echo "[done] Phase 2 demo completed successfully."
echo "[logs] encryption-service: /tmp/aml-enc.log"
echo "[logs] he-gateway:         /tmp/aml-he.log"