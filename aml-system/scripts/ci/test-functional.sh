#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "[phase7] functional tests starting..."
"$ROOT_DIR/tests/integration/he_encrypt_decrypt_positive_test.sh"
"$ROOT_DIR/tests/integration/he_gateway_api_test.sh"
"$ROOT_DIR/tests/integration/he_invalid_input_negative_test.sh"
"$ROOT_DIR/tests/integration/smpc_match_positive_test.sh"
"$ROOT_DIR/tests/integration/smpc_no_match_positive_test.sh"
"$ROOT_DIR/tests/integration/smpc_api_test.sh"
"$ROOT_DIR/tests/integration/smpc_invalid_entity_negative_test.sh"
# Create deterministic transaction + proofs before proof-specific and regulator tests
"$ROOT_DIR/tests/integration/api_end_to_end_test.sh"
"$ROOT_DIR/tests/integration/zk_proof_generation_test.sh"
"$ROOT_DIR/tests/integration/zk_proof_verification_test.sh"
"$ROOT_DIR/tests/integration/zk_invalid_proof_test.sh"
"$ROOT_DIR/tests/integration/regulator_flow_test.sh"
"$ROOT_DIR/tests/integration/e2e_invalid_payload_test.sh"
echo "[phase7] functional tests completed successfully."
