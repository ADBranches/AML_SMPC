#!/usr/bin/env bash

# Source-safe environment loader for the AML demo stack.
# Do NOT use `set -euo pipefail` here because this file is intended to be sourced.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE_FILE="$ROOT_DIR/.env.example"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  source "$ENV_FILE"
  set +a
elif [[ -f "$ENV_EXAMPLE_FILE" ]]; then
  set -a
  source "$ENV_EXAMPLE_FILE"
  set +a
fi

export DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5434/aml_dev}"
export SOFTHSM2_CONF="${SOFTHSM2_CONF:-./infra/softhsm/conf/softhsm2.conf}"
export RUST_LOG="${RUST_LOG:-info}"
export PSEUDO_SALT="${PSEUDO_SALT:-dev_demo_salt_change_me}"

export ENCRYPTION_SERVICE_BASE_URL="${ENCRYPTION_SERVICE_BASE_URL:-http://127.0.0.1:8081}"
export HE_GATEWAY_BASE_URL="${HE_GATEWAY_BASE_URL:-http://127.0.0.1:8082}"
export SMPC_BASE_URL="${SMPC_BASE_URL:-http://127.0.0.1:8083}"
export ZK_PROVER_BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
export REGULATOR_API_BASE_URL="${REGULATOR_API_BASE_URL:-http://127.0.0.1:8085}"

export DEMO_TX_ID="${DEMO_TX_ID:-TX-E2E-001}"
export PERF_PROOF_TX_ID="${PERF_PROOF_TX_ID:-TX-E2E-001}"
export COMPLIANCE_TX_ID="${COMPLIANCE_TX_ID:-TX-E2E-001}"

export LD_LIBRARY_PATH="$ROOT_DIR/services/he-orchestrator/seal-core/build:${LD_LIBRARY_PATH:-}"

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  cat <<EOF
DATABASE_URL=$DATABASE_URL
SOFTHSM2_CONF=$SOFTHSM2_CONF
RUST_LOG=$RUST_LOG
PSEUDO_SALT=$PSEUDO_SALT
ENCRYPTION_SERVICE_BASE_URL=$ENCRYPTION_SERVICE_BASE_URL
HE_GATEWAY_BASE_URL=$HE_GATEWAY_BASE_URL
SMPC_BASE_URL=$SMPC_BASE_URL
ZK_PROVER_BASE_URL=$ZK_PROVER_BASE_URL
REGULATOR_API_BASE_URL=$REGULATOR_API_BASE_URL
DEMO_TX_ID=$DEMO_TX_ID
PERF_PROOF_TX_ID=$PERF_PROOF_TX_ID
COMPLIANCE_TX_ID=$COMPLIANCE_TX_ID
LD_LIBRARY_PATH=$LD_LIBRARY_PATH
EOF
fi