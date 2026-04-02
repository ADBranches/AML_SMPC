#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

source "$ROOT_DIR/scripts/demo/demo-env.sh"

echo "[step] confirming required services before seed ..."
ss -lntp | grep -E ':8081|:8084|:8085|:5434' >/dev/null

echo "[step] seeding deterministic transaction/proof path ..."
bash tests/integration/api_end_to_end_test.sh

echo "[step] verifying regulator API proof list ..."
curl -i http://127.0.0.1:8085/proofs

echo
echo "[ok] demo seed completed"