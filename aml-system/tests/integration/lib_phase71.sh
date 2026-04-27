#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="$ROOT_DIR/tests/evidence/phase7_1"
mkdir -p "$EVIDENCE_DIR"

PHASE71_PIDS=()

phase71_load_env() {
  if [ -f "$ROOT_DIR/.env" ]; then
    set -a
    # shellcheck disable=SC1091
    source "$ROOT_DIR/.env"
    set +a
  fi
}

phase71_psql_url() {
  local url="${DATABASE_URL:-}"
  url="${url/postgresql+psycopg:\/\//postgresql://}"
  echo "$url"
}

phase71_require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1"
    exit 1
  }
}

phase71_require_common() {
  phase71_require_cmd curl
  phase71_require_cmd jq
  phase71_require_cmd cargo
  phase71_require_cmd python3
}

phase71_cleanup() {
  for pid in "${PHASE71_PIDS[@]:-}"; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  done
}

trap phase71_cleanup EXIT

phase71_wait_get() {
  local url="$1"
  local label="$2"

  for _ in $(seq 1 40); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "$label is ready at $url"
      return 0
    fi
    sleep 1
  done

  echo "$label did not become ready at $url"
  return 1
}

phase71_wait_smpc() {
  local url="${1:-http://127.0.0.1:8083}"

  for _ in $(seq 1 40); do
    if curl -fsS \
      -X POST "$url/smpc/screen" \
      -H "Content-Type: application/json" \
      -d '{"tx_id":"TX-SMPC-READY","entity_id":2001}' >/dev/null 2>&1; then
      echo "SMPC runtime is ready at $url"
      return 0
    fi
    sleep 1
  done

  echo "SMPC runtime did not become ready at $url"
  return 1
}

phase71_start_he_gateway() {
  local base_url="${HE_GATEWAY_BASE_URL:-http://127.0.0.1:8082}"

  if curl -fsS "$base_url/health" >/dev/null 2>&1; then
    echo "Using existing HE gateway at $base_url"
    return 0
  fi

  echo "Building SEAL bridge..."
  cmake -S "$ROOT_DIR/services/he-orchestrator/seal-core" \
        -B "$ROOT_DIR/services/he-orchestrator/seal-core/build" \
        >> "$EVIDENCE_DIR/he_seal_build.log" 2>&1

  cmake --build "$ROOT_DIR/services/he-orchestrator/seal-core/build" \
        >> "$EVIDENCE_DIR/he_seal_build.log" 2>&1

  export LD_LIBRARY_PATH="$ROOT_DIR/services/he-orchestrator/seal-core/build:${LD_LIBRARY_PATH:-}"

  echo "Starting HE gateway..."
  (
    cd "$ROOT_DIR"
    HE_GATEWAY_BIND="${HE_GATEWAY_BIND:-127.0.0.1:8082}" \
    cargo run --manifest-path services/he-orchestrator/rust-gateway/Cargo.toml
  ) > "$EVIDENCE_DIR/he_gateway.service.log" 2>&1 &

  PHASE71_PIDS+=("$!")
  phase71_wait_get "$base_url/health" "HE gateway"
}

phase71_start_smpc_runtime() {
  local base_url="${SMPC_BASE_URL:-http://127.0.0.1:8083}"

  if phase71_wait_smpc "$base_url" >/dev/null 2>&1; then
    echo "Using existing SMPC runtime at $base_url"
    return 0
  fi

  echo "Starting SMPC runtime..."
  (
    cd "$ROOT_DIR"
    cargo run --manifest-path services/smpc-orchestrator/runtime/Cargo.toml
  ) > "$EVIDENCE_DIR/smpc_runtime.service.log" 2>&1 &

  PHASE71_PIDS+=("$!")
  phase71_wait_smpc "$base_url"
}

phase71_start_encryption_service() {
  local base_url="${ENCRYPTION_SERVICE_BASE_URL:-http://127.0.0.1:8081}"

  if curl -fsS "$base_url/health" >/dev/null 2>&1; then
    echo "Using existing encryption service at $base_url"
    return 0
  fi

  if [ -z "${DATABASE_URL:-}" ]; then
    echo "DATABASE_URL is required for encryption service"
    exit 1
  fi

  echo "Starting encryption service..."
  (
    cd "$ROOT_DIR"
    ENCRYPTION_SERVICE_BIND="${ENCRYPTION_SERVICE_BIND:-127.0.0.1:8081}" \
    SMPC_BASE_URL="${SMPC_BASE_URL:-http://127.0.0.1:8083}" \
    cargo run --manifest-path services/encryption-service/api/Cargo.toml
  ) > "$EVIDENCE_DIR/encryption_service.service.log" 2>&1 &

  PHASE71_PIDS+=("$!")
  phase71_wait_get "$base_url/health" "Encryption service"
}

phase71_start_zk_prover() {
  local base_url="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"

  if curl -fsS "$base_url/health" >/dev/null 2>&1; then
    echo "Using existing zk prover at $base_url"
    return 0
  fi

  if [ -z "${DATABASE_URL:-}" ]; then
    echo "DATABASE_URL is required for zk prover"
    exit 1
  fi

  echo "Starting zk prover..."
  (
    cd "$ROOT_DIR"
    ZK_PROVER_BIND="${ZK_PROVER_BIND:-127.0.0.1:8084}" \
    cargo run --manifest-path services/zk-prover/prover/Cargo.toml
  ) > "$EVIDENCE_DIR/zk_prover.service.log" 2>&1 &

  PHASE71_PIDS+=("$!")
  phase71_wait_get "$base_url/health" "zk prover"
}

phase71_start_regulator_api() {
  local base_url="${REGULATOR_API_BASE_URL:-http://127.0.0.1:8085}"

  if curl -fsS "$base_url/health" >/dev/null 2>&1; then
    echo "Using existing regulator API at $base_url"
    return 0
  fi

  if [ -z "${DATABASE_URL:-}" ]; then
    echo "DATABASE_URL is required for regulator API"
    exit 1
  fi

  echo "Starting regulator API..."
  (
    cd "$ROOT_DIR"
    REGULATOR_API_BIND="${REGULATOR_API_BIND:-127.0.0.1:8085}" \
    ZK_PROVER_BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}" \
    cargo run --manifest-path services/regulator-api/backend/Cargo.toml
  ) > "$EVIDENCE_DIR/regulator_api.service.log" 2>&1 &

  PHASE71_PIDS+=("$!")
  phase71_wait_get "$base_url/health" "regulator API"
}

phase71_seed_zk_transaction() {
  local tx_id="${1:-TX-PHASE71-ZK-001}"

  if [ -z "${DATABASE_URL:-}" ]; then
    echo "DATABASE_URL is required for database seeding"
    exit 1
  fi

  local psql_url
  psql_url="$(phase71_psql_url)"

  local audit_id_1 audit_id_2 audit_id_3
  audit_id_1="$(python3 -c 'import uuid; print(uuid.uuid4())')"
  audit_id_2="$(python3 -c 'import uuid; print(uuid.uuid4())')"
  audit_id_3="$(python3 -c 'import uuid; print(uuid.uuid4())')"

  psql "$psql_url" -v ON_ERROR_STOP=1 <<SQL
DELETE FROM proofs WHERE tx_id = '$tx_id';
DELETE FROM audit_logs WHERE tx_id = '$tx_id';
DELETE FROM transactions WHERE tx_id = '$tx_id';

INSERT INTO transactions
  (tx_id, sender_pseudo, receiver_pseudo, amount_cipher_ref, currency, transaction_type,
   originator_institution, beneficiary_institution, status, created_at)
VALUES
  ('$tx_id', 'psd_phase71_sender', 'psd_phase71_receiver', NULL, 'USD', 'wire_transfer',
   'Origin Bank Phase71', 'Beneficiary Bank Phase71', 'screened_clear', NOW());

INSERT INTO audit_logs
  (id, tx_id, event_type, event_status, event_ref, details, created_at)
VALUES
  ('$audit_id_1'::uuid, '$tx_id', 'transaction_submitted_and_pseudonymized', 'success', NULL,
   '{"phase":"7.1","source":"seed"}'::jsonb, NOW()),
  ('$audit_id_2'::uuid, '$tx_id', 'sender_screening_completed', 'no_match', '2001',
   '{"entity_id":2001,"screening_result":"no_match"}'::jsonb, NOW()),
  ('$audit_id_3'::uuid, '$tx_id', 'receiver_screening_completed', 'no_match', '2002',
   '{"entity_id":2002,"screening_result":"no_match"}'::jsonb, NOW());
SQL
}

phase71_generate_proofs() {
  local tx_id="${1:-TX-PHASE71-ZK-001}"
  local base_url="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"

  curl -fsS \
    -X POST "$base_url/proofs/generate" \
    -H "Content-Type: application/json" \
    -d "{\"tx_id\":\"$tx_id\"}"
}
