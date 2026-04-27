#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="$ROOT_DIR/tests/evidence/phase7_1/route_context"

mkdir -p "$OUT_DIR"

echo "Collecting Phase 7.1 route/source context..."
echo "Project root: $ROOT_DIR"
echo

FILES=(
  "services/he-orchestrator/seal-core/CMakeLists.txt"
  "services/he-orchestrator/seal-core/include/seal_bridge.hpp"
  "services/he-orchestrator/seal-core/src/context.cpp"
  "services/he-orchestrator/seal-core/src/encrypt.cpp"
  "services/he-orchestrator/seal-core/src/sum.cpp"
  "services/he-orchestrator/seal-core/src/decrypt.cpp"

  "services/he-orchestrator/rust-gateway/Cargo.toml"
  "services/he-orchestrator/rust-gateway/build.rs"
  "services/he-orchestrator/rust-gateway/src/main.rs"
  "services/he-orchestrator/rust-gateway/src/ffi.rs"
  "services/he-orchestrator/rust-gateway/src/routes.rs"

  "services/smpc-orchestrator/programs/sanction_check.mpc"
  "services/smpc-orchestrator/programs/entity_match.mpc"
  "services/smpc-orchestrator/programs/threshold_alert.mpc"
  "services/smpc-orchestrator/runtime/Cargo.toml"
  "services/smpc-orchestrator/runtime/src/main.rs"
  "services/smpc-orchestrator/runtime/src/routes.rs"
  "services/smpc-orchestrator/runtime/src/mp_spdz.rs"
  "services/smpc-orchestrator/runtime/src/parser.rs"

  "services/zk-prover/circuits/fatf-rec10/src/lib.rs"
  "services/zk-prover/circuits/fatf-rec10/src/circuit.rs"
  "services/zk-prover/circuits/fatf-rec10/src/tests.rs"
  "services/zk-prover/circuits/fatf-rec11/src/lib.rs"
  "services/zk-prover/circuits/fatf-rec11/src/circuit.rs"
  "services/zk-prover/circuits/fatf-rec11/src/tests.rs"
  "services/zk-prover/circuits/fatf-rec16/src/lib.rs"
  "services/zk-prover/circuits/fatf-rec16/src/circuit.rs"
  "services/zk-prover/circuits/fatf-rec16/src/tests.rs"
  "services/zk-prover/prover/src/main.rs"
  "services/zk-prover/prover/src/routes.rs"
  "services/zk-prover/prover/src/prove.rs"
  "services/zk-prover/verifier/src/lib.rs"
  "services/zk-prover/verifier/src/verify.rs"

  "services/encryption-service/api/src/main.rs"
  "services/encryption-service/api/src/routes.rs"
  "services/encryption-service/api/src/pseudonymize.rs"
  "services/encryption-service/api/src/smpc_client.rs"
  "services/encryption-service/fpe/mod.rs"

  "services/regulator-api/backend/src/main.rs"
  "services/regulator-api/backend/src/routes.rs"
  "services/regulator-api/backend/src/proofs.rs"
  "services/regulator-api/backend/src/audit.rs"
  "services/regulator-api/backend/src/db.rs"
)

for file in "${FILES[@]}"; do
  echo "===== $file ====="

  if [ -f "$ROOT_DIR/$file" ]; then
    safe_name="$(echo "$file" | tr '/' '_')"
    cp "$ROOT_DIR/$file" "$OUT_DIR/$safe_name"
    sed -n '1,240p' "$ROOT_DIR/$file"
  else
    echo "MISSING: $file"
  fi

  echo
done

echo "Route context saved to:"
echo "$OUT_DIR"
