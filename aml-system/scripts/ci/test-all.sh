#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5434/aml_dev}"

"$ROOT_DIR/scripts/ci/build-all.sh"

echo "[test] running unit tests..."
cargo test --manifest-path "$ROOT_DIR/services/zk-prover/prover/Cargo.toml"
cargo test --manifest-path "$ROOT_DIR/services/zk-prover/verifier/Cargo.toml"

echo "[test] running demo validations..."
"$ROOT_DIR/scripts/demo/run-phase2-demo.sh"
"$ROOT_DIR/scripts/demo/run-phase3-integrated-demo.sh"
"$ROOT_DIR/scripts/demo/run-phase4-demo.sh"
"$ROOT_DIR/scripts/demo/run-phase5-demo.sh"

echo "[done] test-all completed successfully."
