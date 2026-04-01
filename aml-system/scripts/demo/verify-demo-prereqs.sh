#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/demo/demo-env.sh"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "[error] missing required command: $1"; exit 1; }
}

require_file() {
  [[ -f "$1" ]] || { echo "[error] missing required file: $1"; exit 1; }
}

require_cmd psql
require_cmd cargo
require_cmd cmake
require_cmd curl
require_cmd jq
require_cmd bash

require_file "$ROOT_DIR/.env"
require_file "$ROOT_DIR/.env.example"
require_file "$ROOT_DIR/Makefile"
require_file "$ROOT_DIR/services/he-orchestrator/seal-core/CMakeLists.txt"
require_file "$ROOT_DIR/services/encryption-service/api/Cargo.toml"
require_file "$ROOT_DIR/services/he-orchestrator/rust-gateway/Cargo.toml"
require_file "$ROOT_DIR/services/smpc-orchestrator/runtime/Cargo.toml"
require_file "$ROOT_DIR/services/zk-prover/prover/Cargo.toml"
require_file "$ROOT_DIR/services/regulator-api/backend/Cargo.toml"

psql "$DATABASE_URL" -Atqc "SELECT 1;" | grep -qx '1'
psql "$DATABASE_URL" -Atqc "SELECT to_regclass('public.transactions');" | grep -qx 'transactions'
psql "$DATABASE_URL" -Atqc "SELECT to_regclass('public.audit_logs');" | grep -qx 'audit_logs'
psql "$DATABASE_URL" -Atqc "SELECT to_regclass('public.proofs');" | grep -qx 'proofs'

[[ "$DEMO_TX_ID" == "TX-E2E-001" ]] || { echo "[error] unexpected DEMO_TX_ID: $DEMO_TX_ID"; exit 1; }
[[ "$PERF_PROOF_TX_ID" == "TX-E2E-001" ]] || { echo "[error] unexpected PERF_PROOF_TX_ID: $PERF_PROOF_TX_ID"; exit 1; }
[[ "$COMPLIANCE_TX_ID" == "TX-E2E-001" ]] || { echo "[error] unexpected COMPLIANCE_TX_ID: $COMPLIANCE_TX_ID"; exit 1; }

echo "[ok] demo prerequisites verified"