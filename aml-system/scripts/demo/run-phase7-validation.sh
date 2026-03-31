#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "[demo] Phase 7 validation sequence starting"
"$ROOT_DIR/scripts/ci/test-functional.sh"
"$ROOT_DIR/scripts/ci/test-compliance.sh"
echo "[demo] Phase 7 validation sequence completed"
