#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="$ROOT_DIR/tests/evidence/phase7_1"
mkdir -p "$EVIDENCE_DIR"

cd "$ROOT_DIR"

run_step() {
  local name="$1"
  shift

  echo
  echo "============================================================"
  echo "PHASE 7.1 STEP: $name"
  echo "============================================================"

  "$@" 2>&1 | tee "$EVIDENCE_DIR/${name}.log"
}

run_step "he_gateway_cargo_build" \
  cargo build --manifest-path services/he-orchestrator/rust-gateway/Cargo.toml

run_step "smpc_runtime_cargo_build" \
  cargo build --manifest-path services/smpc-orchestrator/runtime/Cargo.toml

run_step "zk_prover_cargo_build" \
  cargo build --manifest-path services/zk-prover/prover/Cargo.toml

run_step "zk_rec10_cargo_test" \
  cargo test --manifest-path services/zk-prover/circuits/fatf-rec10/Cargo.toml

run_step "zk_rec11_cargo_test" \
  cargo test --manifest-path services/zk-prover/circuits/fatf-rec11/Cargo.toml

run_step "zk_rec16_cargo_test" \
  cargo test --manifest-path services/zk-prover/circuits/fatf-rec16/Cargo.toml

echo
echo "Phase 7.1 build and circuit validation completed."
echo "Evidence logs saved in: $EVIDENCE_DIR"
