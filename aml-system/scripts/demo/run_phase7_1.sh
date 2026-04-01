#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

export DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5434/aml_dev}"
export PSEUDO_SALT="${PSEUDO_SALT:-dev_demo_salt_change_me}"
export SMPC_BASE_URL="${SMPC_BASE_URL:-http://127.0.0.1:8083}"
export ZK_PROVER_BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
export REGULATOR_API_BASE_URL="${REGULATOR_API_BASE_URL:-http://127.0.0.1:8085}"
export RUST_LOG="${RUST_LOG:-info}"

ENC_MANIFEST="$ROOT_DIR/services/encryption-service/api/Cargo.toml"
HE_MANIFEST="$ROOT_DIR/services/he-orchestrator/rust-gateway/Cargo.toml"
SMPC_MANIFEST="$ROOT_DIR/services/smpc-orchestrator/runtime/Cargo.toml"
ZK_MANIFEST="$ROOT_DIR/services/zk-prover/prover/Cargo.toml"
REG_MANIFEST="$ROOT_DIR/services/regulator-api/backend/Cargo.toml"

SEAL_BUILD_DIR="$ROOT_DIR/services/he-orchestrator/seal-core/build"
SEAL_LIB_DIR="$SEAL_BUILD_DIR"

ENC_URL="${ENCRYPTION_SERVICE_BASE_URL:-http://127.0.0.1:8081}"
HE_URL="${HE_GATEWAY_BASE_URL:-http://127.0.0.1:8082}"
SMPC_URL="${SMPC_BASE_URL:-http://127.0.0.1:8083}"
ZK_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
REG_URL="${REGULATOR_API_BASE_URL:-http://127.0.0.1:8085}"

ENC_PID=""
HE_PID=""
SMPC_PID=""
ZK_PID=""
REG_PID=""

dump_logs() {
  echo
  echo "[logs] /tmp/aml-enc.log"
  tail -n 120 /tmp/aml-enc.log 2>/dev/null || true
  echo
  echo "[logs] /tmp/aml-he.log"
  tail -n 120 /tmp/aml-he.log 2>/dev/null || true
  echo
  echo "[logs] /tmp/aml-smpc.log"
  tail -n 120 /tmp/aml-smpc.log 2>/dev/null || true
  echo
  echo "[logs] /tmp/aml-zk.log"
  tail -n 120 /tmp/aml-zk.log 2>/dev/null || true
  echo
  echo "[logs] /tmp/aml-reg.log"
  tail -n 120 /tmp/aml-reg.log 2>/dev/null || true
}

cleanup() {
  echo
  echo "[cleanup] stopping Phase 7.1 background services..."
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
  local retries="${3:-180}"

  echo "[wait] waiting for ${name} at ${url} ..."
  for ((i=1; i<=retries; i++)); do
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -Eq "^(200|404|405)$"; then
      echo "[ok] ${name} is reachable"
      return 0
    fi
    sleep 1
  done

  echo "[error] ${name} did not become reachable: ${url}"
  dump_logs
  return 1
}

prebuild_services() {
  echo "[phase7.1] prebuilding Rust services..."
  cargo build --manifest-path "$ENC_MANIFEST"
  cargo build --manifest-path "$HE_MANIFEST"
  cargo build --manifest-path "$SMPC_MANIFEST"
  cargo build --manifest-path "$ZK_MANIFEST"
  cargo build --manifest-path "$REG_MANIFEST"
}

echo "[phase7.1] checking prerequisites..."
require_cmd cmake
require_cmd cargo
require_cmd curl
require_cmd jq
require_cmd fuser
require_cmd psql
require_cmd bash

psql "$DATABASE_URL" -Atqc "SELECT to_regclass('public.transactions');" | grep -qx "transactions"
psql "$DATABASE_URL" -Atqc "SELECT to_regclass('public.audit_logs');" | grep -qx "audit_logs"
psql "$DATABASE_URL" -Atqc "SELECT to_regclass('public.proofs');" | grep -qx "proofs"

echo "[phase7.1] freeing ports 8081..8085 ..."
fuser -k 8081/tcp 8082/tcp 8083/tcp 8084/tcp 8085/tcp 2>/dev/null || true

echo "[phase7.1] building SEAL bridge..."
rm -rf "$SEAL_BUILD_DIR"
cmake -S "$ROOT_DIR/services/he-orchestrator/seal-core" -B "$SEAL_BUILD_DIR"
cmake --build "$SEAL_BUILD_DIR" -j"$(nproc)"

test -f "$SEAL_LIB_DIR/libseal_bridge.so"

export LD_LIBRARY_PATH="$SEAL_LIB_DIR:${LD_LIBRARY_PATH:-}"

prebuild_services

echo "[phase7.1] starting encryption-service..."
cargo run --manifest-path "$ENC_MANIFEST" >/tmp/aml-enc.log 2>&1 &
ENC_PID=$!
sleep 2

echo "[phase7.1] starting HE gateway..."
cargo run --manifest-path "$HE_MANIFEST" >/tmp/aml-he.log 2>&1 &
HE_PID=$!
sleep 2

echo "[phase7.1] starting SMPC runtime..."
cargo run --manifest-path "$SMPC_MANIFEST" >/tmp/aml-smpc.log 2>&1 &
SMPC_PID=$!
sleep 2

echo "[phase7.1] starting zk prover..."
cargo run --manifest-path "$ZK_MANIFEST" >/tmp/aml-zk.log 2>&1 &
ZK_PID=$!
sleep 2

echo "[phase7.1] starting regulator API..."
cargo run --manifest-path "$REG_MANIFEST" >/tmp/aml-reg.log 2>&1 &
REG_PID=$!
sleep 2

wait_for_post "$ENC_URL/transactions/submit" "encryption-service"
wait_for_post "$HE_URL/he/encrypt" "he-gateway"
wait_for_post "$SMPC_URL/smpc/screen" "smpc-runtime"
wait_for_post "$ZK_URL/proofs/generate" "zk-prover"
wait_for_post "$REG_URL/proofs" "regulator-api"

echo "[phase7.1] functional tests starting..."

tests=(
  "tests/integration/he_encrypt_decrypt_positive_test.sh"
  "tests/integration/he_gateway_api_test.sh"
  "tests/integration/he_invalid_input_negative_test.sh"
  "tests/integration/smpc_match_positive_test.sh"
  "tests/integration/smpc_no_match_positive_test.sh"
  "tests/integration/smpc_api_test.sh"
  "tests/integration/smpc_invalid_entity_negative_test.sh"
  "tests/integration/api_end_to_end_test.sh"
  "tests/integration/zk_proof_generation_test.sh"
  "tests/integration/zk_proof_verification_test.sh"
  "tests/integration/zk_invalid_proof_test.sh"
  "tests/integration/regulator_flow_test.sh"
  "tests/integration/e2e_invalid_payload_test.sh"
)

for test_file in "${tests[@]}"; do
  echo "[run] $test_file"
  bash "$test_file"
done

echo
echo "[done] Phase 7.1 functional tests completed successfully."
