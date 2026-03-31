#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "[phase7] compliance tests starting..."
"$ROOT_DIR/tests/compliance/rec10_proof_test.sh"
"$ROOT_DIR/tests/compliance/rec11_proof_test.sh"
"$ROOT_DIR/tests/compliance/rec16_proof_test.sh"
"$ROOT_DIR/tests/compliance/rec10_validation.sh"
"$ROOT_DIR/tests/compliance/rec11_validation.sh"
"$ROOT_DIR/tests/compliance/rec16_validation.sh"
echo "[phase7] compliance tests completed successfully."
