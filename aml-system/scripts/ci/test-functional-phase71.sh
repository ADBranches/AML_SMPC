#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

mkdir -p tests/evidence/phase7_1

echo "============================================================"
echo "Phase 7.1 Functional Test Runner"
echo "============================================================"

./tests/integration/he_gateway_api_test.sh
./tests/integration/smpc_api_test.sh
./tests/integration/zk_proof_generation_test.sh
./tests/integration/zk_proof_verification_test.sh
./tests/compliance/rec10_proof_test.sh
./tests/compliance/rec11_proof_test.sh
./tests/compliance/rec16_proof_test.sh
./tests/integration/api_end_to_end_test.sh

echo
echo "Phase 7.1 functional test runner PASSED"
echo "Evidence saved under tests/evidence/phase7_1"
