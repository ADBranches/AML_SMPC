#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SEAL_BUILD_DIR="$ROOT_DIR/services/he-orchestrator/seal-core/build"

export DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5433/aml_dev}"

echo "[build] building SEAL bridge..."
rm -rf "$SEAL_BUILD_DIR"
cmake -S "$ROOT_DIR/services/he-orchestrator/seal-core" -B "$SEAL_BUILD_DIR"
cmake --build "$SEAL_BUILD_DIR" -j"$(nproc)"

export LD_LIBRARY_PATH="$SEAL_BUILD_DIR:${LD_LIBRARY_PATH:-}"

echo "[build] building rust services..."
cargo build --manifest-path "$ROOT_DIR/services/encryption-service/api/Cargo.toml" --release
cargo build --manifest-path "$ROOT_DIR/services/he-orchestrator/rust-gateway/Cargo.toml" --release
cargo build --manifest-path "$ROOT_DIR/services/smpc-orchestrator/runtime/Cargo.toml" --release
cargo build --manifest-path "$ROOT_DIR/services/zk-prover/prover/Cargo.toml" --release
cargo build --manifest-path "$ROOT_DIR/services/regulator-api/backend/Cargo.toml" --release

echo "[done] build-all completed successfully."
