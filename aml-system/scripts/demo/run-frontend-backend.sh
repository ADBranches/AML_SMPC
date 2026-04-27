#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

source "$ROOT_DIR/tests/integration/lib_phase71.sh"

phase71_load_env
phase71_require_common
phase71_require_cmd curl
phase71_require_cmd cargo
phase71_require_cmd psql

EVIDENCE_DIR="$ROOT_DIR/tests/evidence/frontend_runtime"
mkdir -p "$EVIDENCE_DIR"

PIDS=()

cleanup() {
  echo
  echo "Stopping AML SMPC frontend-demo backend services..."

  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done

  wait 2>/dev/null || true
  echo "Backend services stopped."
}

trap cleanup INT TERM

wait_for_url() {
  local name="$1"
  local url="$2"
  local log_file="$3"
  local max_attempts="${4:-90}"

  echo "Waiting for $name at $url ..."

  for attempt in $(seq 1 "$max_attempts"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "$name is ready at $url"
      return 0
    fi

    sleep 1
  done

  echo
  echo "ERROR: $name did not become ready at $url"
  echo "Last log lines from $log_file:"
  tail -n 80 "$log_file" || true
  return 1
}

echo "============================================================"
echo "AML SMPC BACKEND FOR FRONTEND DEMO"
echo "============================================================"

echo
echo "Starting backend services with live frontend support..."
echo "Logs directory: $EVIDENCE_DIR"

echo
echo "Starting HE gateway..."
(
  cd "$ROOT_DIR"

  export HE_GATEWAY_BIND="${HE_GATEWAY_BIND:-127.0.0.1:8082}"
  export LD_LIBRARY_PATH="$ROOT_DIR/services/he-orchestrator/seal-core/build:$ROOT_DIR/services/he-orchestrator/seal-core/build/seal/lib:$ROOT_DIR/services/he-orchestrator/seal-core/build/seal/native/src:${LD_LIBRARY_PATH:-}"

  cargo run --manifest-path services/he-orchestrator/rust-gateway/Cargo.toml
) > "$EVIDENCE_DIR/he_gateway.service.log" 2>&1 &
PIDS+=("$!")

echo "Starting SMPC runtime..."
(
  cd "$ROOT_DIR"
  cargo run --manifest-path services/smpc-orchestrator/runtime/Cargo.toml
) > "$EVIDENCE_DIR/smpc_runtime.service.log" 2>&1 &
PIDS+=("$!")

echo "Starting encryption service..."
(
  cd "$ROOT_DIR"

  export ENCRYPTION_SERVICE_BIND="${ENCRYPTION_SERVICE_BIND:-127.0.0.1:8081}"
  export SMPC_BASE_URL="${SMPC_BASE_URL:-http://127.0.0.1:8083}"

  cargo run --manifest-path services/encryption-service/api/Cargo.toml
) > "$EVIDENCE_DIR/encryption_service.service.log" 2>&1 &
PIDS+=("$!")

echo "Starting zk prover..."
(
  cd "$ROOT_DIR"

  export ZK_PROVER_BIND="${ZK_PROVER_BIND:-127.0.0.1:8084}"

  cargo run --manifest-path services/zk-prover/prover/Cargo.toml
) > "$EVIDENCE_DIR/zk_prover.service.log" 2>&1 &
PIDS+=("$!")

echo "Starting regulator API..."
(
  cd "$ROOT_DIR"

  export REGULATOR_API_BIND="${REGULATOR_API_BIND:-127.0.0.1:8085}"
  export ZK_PROVER_BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"

  cargo run --manifest-path services/regulator-api/backend/Cargo.toml
) > "$EVIDENCE_DIR/regulator_api.service.log" 2>&1 &
PIDS+=("$!")

echo
wait_for_url "HE gateway" "http://127.0.0.1:8082/health" "$EVIDENCE_DIR/he_gateway.service.log" 120
wait_for_url "SMPC runtime" "http://127.0.0.1:8083/health" "$EVIDENCE_DIR/smpc_runtime.service.log" 90
wait_for_url "encryption service" "http://127.0.0.1:8081/health" "$EVIDENCE_DIR/encryption_service.service.log" 90
wait_for_url "zk prover" "http://127.0.0.1:8084/health" "$EVIDENCE_DIR/zk_prover.service.log" 90
wait_for_url "regulator API" "http://127.0.0.1:8085/health" "$EVIDENCE_DIR/regulator_api.service.log" 90

echo
echo "Backend services are ready:"
echo "encryption-service: http://127.0.0.1:8081"
echo "he-orchestrator:     http://127.0.0.1:8082"
echo "smpc-orchestrator:   http://127.0.0.1:8083"
echo "zk-prover:           http://127.0.0.1:8084"
echo "regulator-api:       http://127.0.0.1:8085"

echo
echo "Frontend should use:"
echo "VITE_REGULATOR_API_BASE_URL=/api/regulator"
echo "VITE_ENCRYPTION_API_BASE_URL=/api/encryption"
echo "VITE_HE_API_BASE_URL=/api/he"
echo "VITE_SMPC_API_BASE_URL=/api/smpc"
echo "VITE_ZK_PROVER_BASE_URL=/api/zk"

echo
echo "Keep this terminal open while using the frontend."
echo "Press Ctrl+C to stop services started by this script."

while true; do
  sleep 3600
done
