#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -d "$SCRIPT_DIR/aml-system" ]]; then
  ROOT_DIR="$SCRIPT_DIR/aml-system"
elif [[ -f "$SCRIPT_DIR/Cargo.toml" || -d "$SCRIPT_DIR/services" ]]; then
  ROOT_DIR="$SCRIPT_DIR"
else
  ROOT_DIR="$(pwd)"
fi
cd "$ROOT_DIR"

if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

export DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5434/aml_dev}"
export ENCRYPTION_SERVICE_BASE_URL="${ENCRYPTION_SERVICE_BASE_URL:-http://127.0.0.1:8081}"
export HE_GATEWAY_BASE_URL="${HE_GATEWAY_BASE_URL:-http://127.0.0.1:8082}"
export SMPC_BASE_URL="${SMPC_BASE_URL:-http://127.0.0.1:8083}"
export ZK_PROVER_BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
export REGULATOR_API_BASE_URL="${REGULATOR_API_BASE_URL:-http://127.0.0.1:8085}"
export PSEUDO_SALT="${PSEUDO_SALT:-dev_demo_salt_change_me}"
export RUST_LOG="${RUST_LOG:-info}"
export PERF_PROOF_TX_ID="${PERF_PROOF_TX_ID:-TX-E2E-001}"

ENC_MANIFEST="$ROOT_DIR/services/encryption-service/api/Cargo.toml"
HE_MANIFEST="$ROOT_DIR/services/he-orchestrator/rust-gateway/Cargo.toml"
SMPC_MANIFEST="$ROOT_DIR/services/smpc-orchestrator/runtime/Cargo.toml"
ZK_MANIFEST="$ROOT_DIR/services/zk-prover/prover/Cargo.toml"
REG_MANIFEST="$ROOT_DIR/services/regulator-api/backend/Cargo.toml"

SEAL_BUILD_DIR="$ROOT_DIR/services/he-orchestrator/seal-core/build"
PERF_DIR="$ROOT_DIR/tests/performance"
PERF_LOG_DIR="$PERF_DIR/logs"
RUNSTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TX_WARMUP_LOG="$PERF_LOG_DIR/transaction_warmup_${RUNSTAMP}.log"
TX_MEASURED_LOG="$PERF_LOG_DIR/transaction_measured_${RUNSTAMP}.log"
PROOF_WARMUP_LOG="$PERF_LOG_DIR/proof_warmup_${RUNSTAMP}.log"
PROOF_MEASURED_LOG="$PERF_LOG_DIR/proof_measured_${RUNSTAMP}.log"
SUMMARY_FILE="$PERF_LOG_DIR/run_phase7_2_summary_${RUNSTAMP}.md"
mkdir -p "$PERF_LOG_DIR"

ENC_PID=""
HE_PID=""
SMPC_PID=""
ZK_PID=""
REG_PID=""

cleanup() {
  echo
  echo "[cleanup] stopping Phase 7.2 background services..."
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

require_locust() {
  if python -m locust --version >/dev/null 2>&1; then
    LOCUST_CMD=(python -m locust)
  elif command -v locust >/dev/null 2>&1; then
    LOCUST_CMD=(locust)
  else
    echo "[error] locust is not installed in the active environment"
    echo "[hint] activate your venv and install with: python -m pip install locust"
    exit 1
  fi
}

wait_for_post() {
  local url="$1"
  local name="$2"
  local retries="${3:-180}"

  echo "[wait] waiting for ${name} at ${url} ..."
  for ((i=1; i<=retries; i++)); do
    code="$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)"
    if [[ "$code" =~ ^(200|404|405)$ ]]; then
      echo "[ok] ${name} is reachable"
      return 0
    fi
    sleep 1
  done

  echo "[error] ${name} did not become reachable: ${url}"
  return 1
}

prebuild_services() {
  echo "[phase7.2] prebuilding Rust services..."
  cargo build --manifest-path "$ENC_MANIFEST"
  cargo build --manifest-path "$HE_MANIFEST"
  cargo build --manifest-path "$SMPC_MANIFEST"
  cargo build --manifest-path "$ZK_MANIFEST"
  cargo build --manifest-path "$REG_MANIFEST"
}

start_stack() {
  echo "[phase7.2] freeing ports 8081..8085 ..."
  fuser -k 8081/tcp 8082/tcp 8083/tcp 8084/tcp 8085/tcp 2>/dev/null || true

  echo "[phase7.2] building SEAL bridge..."
  rm -rf "$SEAL_BUILD_DIR"
  cmake -S "$ROOT_DIR/services/he-orchestrator/seal-core" -B "$SEAL_BUILD_DIR"
  cmake --build "$SEAL_BUILD_DIR" -j"$(nproc)"
  test -f "$SEAL_BUILD_DIR/libseal_bridge.so"
  export LD_LIBRARY_PATH="$SEAL_BUILD_DIR:${LD_LIBRARY_PATH:-}"

  prebuild_services

  echo "[phase7.2] starting encryption-service..."
  cargo run --manifest-path "$ENC_MANIFEST" >/tmp/aml-enc.log 2>&1 &
  ENC_PID=$!
  sleep 2

  echo "[phase7.2] starting HE gateway..."
  cargo run --manifest-path "$HE_MANIFEST" >/tmp/aml-he.log 2>&1 &
  HE_PID=$!
  sleep 2

  echo "[phase7.2] starting SMPC runtime..."
  cargo run --manifest-path "$SMPC_MANIFEST" >/tmp/aml-smpc.log 2>&1 &
  SMPC_PID=$!
  sleep 2

  echo "[phase7.2] starting zk prover..."
  cargo run --manifest-path "$ZK_MANIFEST" >/tmp/aml-zk.log 2>&1 &
  ZK_PID=$!
  sleep 2

  echo "[phase7.2] starting regulator API..."
  cargo run --manifest-path "$REG_MANIFEST" >/tmp/aml-reg.log 2>&1 &
  REG_PID=$!
  sleep 2

  wait_for_post "$ENCRYPTION_SERVICE_BASE_URL/transactions/submit" "encryption-service"
  wait_for_post "$HE_GATEWAY_BASE_URL/he/encrypt" "he-gateway"
  wait_for_post "$SMPC_BASE_URL/smpc/screen" "smpc-runtime"
  wait_for_post "$ZK_PROVER_BASE_URL/proofs/generate" "zk-prover"
  wait_for_post "$REGULATOR_API_BASE_URL/proofs" "regulator-api"
}

seed_proof_context() {
  echo "[phase7.2] seeding valid transaction context for proof benchmarking..."
  bash "$ROOT_DIR/tests/integration/api_end_to_end_test.sh"

  local latest_evidence
  latest_evidence="$(ls -1t "$ROOT_DIR/tests/evidence/functional/api"/api_end_to_end_test_*.json 2>/dev/null | head -n 1 || true)"
  if [[ -n "$latest_evidence" ]]; then
    local seeded_tx
    seeded_tx="$(python - <<'PY' "$latest_evidence"
import json, sys
path = sys.argv[1]
with open(path, encoding='utf-8') as f:
    data = json.load(f)
print(data.get('record', {}).get('tx_id', '') or '')
PY
)"
    if [[ -n "$seeded_tx" ]]; then
      export PERF_PROOF_TX_ID="$seeded_tx"
    fi
  fi

  echo "[phase7.2] proof benchmark tx_id: $PERF_PROOF_TX_ID"
}

run_locust() {
  local user_class="$1"
  local host="$2"
  local users="$3"
  local rate="$4"
  local duration="$5"
  local logfile="$6"

  echo "[phase7.2] running ${user_class} users=${users} rate=${rate} duration=${duration} host=${host}"
  (
    cd "$PERF_DIR"
    ENCRYPTION_SERVICE_BASE_URL="$ENCRYPTION_SERVICE_BASE_URL" \
    ZK_PROVER_BASE_URL="$ZK_PROVER_BASE_URL" \
    PERF_PROOF_TX_ID="$PERF_PROOF_TX_ID" \
    "${LOCUST_CMD[@]}" -f locustfile.py "$user_class" --headless -u "$users" -r "$rate" -t "$duration" --host "$host"
  ) | tee "$logfile"
}

write_summary() {
  cat > "$SUMMARY_FILE" <<EOF2
# Phase 7.2 Run Summary

- Timestamp: $RUNSTAMP
- DATABASE_URL: $DATABASE_URL
- ENCRYPTION_SERVICE_BASE_URL: $ENCRYPTION_SERVICE_BASE_URL
- ZK_PROVER_BASE_URL: $ZK_PROVER_BASE_URL
- PERF_PROOF_TX_ID: $PERF_PROOF_TX_ID

## Logs
- Transaction warmup: $TX_WARMUP_LOG
- Transaction measured: $TX_MEASURED_LOG
- Proof warmup: $PROOF_WARMUP_LOG
- Proof measured: $PROOF_MEASURED_LOG

## Service logs
- /tmp/aml-enc.log
- /tmp/aml-he.log
- /tmp/aml-smpc.log
- /tmp/aml-zk.log
- /tmp/aml-reg.log
EOF2
}

echo "[phase7.2] checking prerequisites..."
require_cmd cmake
require_cmd cargo
require_cmd curl
require_cmd jq
require_cmd fuser
require_cmd psql
require_cmd python
require_locust

psql "$DATABASE_URL" -Atqc "SELECT to_regclass('public.transactions');" | grep -qx "transactions"
psql "$DATABASE_URL" -Atqc "SELECT to_regclass('public.audit_logs');" | grep -qx "audit_logs"
psql "$DATABASE_URL" -Atqc "SELECT to_regclass('public.proofs');" | grep -qx "proofs"

start_stack
seed_proof_context

run_locust TransactionUser "$ENCRYPTION_SERVICE_BASE_URL" 10 2 20s "$TX_WARMUP_LOG"
run_locust TransactionUser "$ENCRYPTION_SERVICE_BASE_URL" 50 10 60s "$TX_MEASURED_LOG"
run_locust ProofUser "$ZK_PROVER_BASE_URL" 5 1 20s "$PROOF_WARMUP_LOG"
run_locust ProofUser "$ZK_PROVER_BASE_URL" 20 5 60s "$PROOF_MEASURED_LOG"

write_summary

echo

echo "[done] Phase 7.2 performance runs completed successfully."
echo "[summary] $SUMMARY_FILE"
