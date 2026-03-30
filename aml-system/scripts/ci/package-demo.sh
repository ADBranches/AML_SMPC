#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="$ROOT_DIR/dist/phase6"
mkdir -p "$OUT_DIR"

"$ROOT_DIR/scripts/ci/build-all.sh"

cp "$ROOT_DIR/services/encryption-service/api/target/release/encryption-service-api" "$OUT_DIR/" || true
cp "$ROOT_DIR/services/he-orchestrator/rust-gateway/target/release/he-rust-gateway" "$OUT_DIR/" || true
cp "$ROOT_DIR/services/smpc-orchestrator/runtime/target/release/smpc-orchestrator-runtime" "$OUT_DIR/" || true
cp "$ROOT_DIR/services/zk-prover/prover/target/release/zk-prover-service" "$OUT_DIR/" || true
cp "$ROOT_DIR/services/regulator-api/backend/target/release/regulator-api-backend" "$OUT_DIR/" || true
cp "$ROOT_DIR/services/he-orchestrator/seal-core/build/libseal_bridge.so" "$OUT_DIR/" || true

tar -C "$ROOT_DIR/dist" -czf "$ROOT_DIR/dist/aml-phase6-demo-bundle.tar.gz" phase6

echo "[done] package created at $ROOT_DIR/dist/aml-phase6-demo-bundle.tar.gz"
