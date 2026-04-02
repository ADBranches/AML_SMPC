#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

source "$ROOT_DIR/scripts/demo/demo-env.sh"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "[error] missing required command: $1"
    exit 1
  }
}

wait_for_port() {
  local port="$1"
  local label="$2"
  local retries="${3:-40}"

  echo "[wait] waiting for $label on port $port ..."
  for ((i=1; i<=retries; i++)); do
    if ss -lnt | awk '{print $4}' | grep -Eq "(^|:)$port$"; then
      echo "[ok] $label is listening on $port"
      return 0
    fi
    sleep 1
  done

  echo "[error] $label did not start on port $port"
  return 1
}

require_cmd cargo
require_cmd psql
require_cmd ss
require_cmd make

echo "[step] starting local Postgres ..."
make dev-up

echo "[step] verifying database connection ..."
psql "$DATABASE_URL" -c '\conninfo'

echo "[step] stopping stale local service processes ..."
pkill -f encryption-service-api || true
pkill -f he-rust-gateway || true
pkill -f zk-prover-service || true
pkill -f regulator-api-backend || true
pkill -f '/runtime/target/debug/runtime' || true

echo "[step] prebuilding services ..."
cargo build --manifest-path services/encryption-service/api/Cargo.toml
cargo build --manifest-path services/he-orchestrator/rust-gateway/Cargo.toml
cargo build --manifest-path services/smpc-orchestrator/runtime/Cargo.toml
cargo build --manifest-path services/zk-prover/prover/Cargo.toml
cargo build --manifest-path services/regulator-api/backend/Cargo.toml

echo "[step] starting services ..."
cargo run --manifest-path services/encryption-service/api/Cargo.toml >/tmp/aml-enc.log 2>&1 &
cargo run --manifest-path services/he-orchestrator/rust-gateway/Cargo.toml >/tmp/aml-he.log 2>&1 &
cargo run --manifest-path services/smpc-orchestrator/runtime/Cargo.toml >/tmp/aml-smpc.log 2>&1 &
cargo run --manifest-path services/zk-prover/prover/Cargo.toml >/tmp/aml-zk.log 2>&1 &
cargo run --manifest-path services/regulator-api/backend/Cargo.toml >/tmp/aml-reg.log 2>&1 &

wait_for_port 8081 "encryption-service" || { tail -n 80 /tmp/aml-enc.log; exit 1; }
wait_for_port 8082 "he-rust-gateway" || { tail -n 80 /tmp/aml-he.log; exit 1; }
wait_for_port 8083 "smpc-runtime" || { tail -n 80 /tmp/aml-smpc.log; exit 1; }
wait_for_port 8084 "zk-prover" || { tail -n 80 /tmp/aml-zk.log; exit 1; }
wait_for_port 8085 "regulator-api" || { tail -n 80 /tmp/aml-reg.log; exit 1; }

echo
echo "[ok] local backend stack is running"
ss -lntp | grep -E ':8081|:8082|:8083|:8084|:8085|:5434' || true