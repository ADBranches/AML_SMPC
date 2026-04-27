#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib_phase71.sh"

phase71_load_env
phase71_require_common
phase71_start_he_gateway

BASE_URL="${HE_GATEWAY_BASE_URL:-http://127.0.0.1:8082}"
OUT="$EVIDENCE_DIR/he_gateway_api_test.log"
FIXTURE="$ROOT_DIR/tests/fixtures/he_test_vectors.json"

{
  echo "Running HE gateway API functional test..."
  echo "Base URL: $BASE_URL"

  v1="$(jq -r '.values[0]' "$FIXTURE")"
  v2="$(jq -r '.values[1]' "$FIXTURE")"
  v3="$(jq -r '.values[2]' "$FIXTURE")"
  expected="$(jq -r '.expected_sum' "$FIXTURE")"
  tolerance="$(jq -r '.tolerance' "$FIXTURE")"

  c1="$(curl -fsS -X POST "$BASE_URL/he/encrypt" -H "Content-Type: application/json" -d "{\"amount\":$v1}" | tee "$EVIDENCE_DIR/he_encrypt_1.json" | jq -r '.ciphertext_hex')"
  c2="$(curl -fsS -X POST "$BASE_URL/he/encrypt" -H "Content-Type: application/json" -d "{\"amount\":$v2}" | tee "$EVIDENCE_DIR/he_encrypt_2.json" | jq -r '.ciphertext_hex')"
  c3="$(curl -fsS -X POST "$BASE_URL/he/encrypt" -H "Content-Type: application/json" -d "{\"amount\":$v3}" | tee "$EVIDENCE_DIR/he_encrypt_3.json" | jq -r '.ciphertext_hex')"

  s12="$(curl -fsS -X POST "$BASE_URL/he/sum" -H "Content-Type: application/json" \
    -d "$(jq -n --arg lhs "$c1" --arg rhs "$c2" '{lhs_ciphertext_hex:$lhs,rhs_ciphertext_hex:$rhs}')" \
    | tee "$EVIDENCE_DIR/he_sum_12.json" | jq -r '.result_ciphertext_hex')"

  s123="$(curl -fsS -X POST "$BASE_URL/he/sum" -H "Content-Type: application/json" \
    -d "$(jq -n --arg lhs "$s12" --arg rhs "$c3" '{lhs_ciphertext_hex:$lhs,rhs_ciphertext_hex:$rhs}')" \
    | tee "$EVIDENCE_DIR/he_sum_123.json" | jq -r '.result_ciphertext_hex')"

  actual="$(curl -fsS -X POST "$BASE_URL/he/decrypt-test" -H "Content-Type: application/json" \
    -d "$(jq -n --arg ciphertext "$s123" '{ciphertext_hex:$ciphertext}')" \
    | tee "$EVIDENCE_DIR/he_decrypt_result.json" | jq -r '.amount')"

  python3 - <<PY
actual = float("$actual")
expected = float("$expected")
tolerance = float("$tolerance")
diff = abs(actual - expected)
print(f"actual={actual}")
print(f"expected={expected}")
print(f"tolerance={tolerance}")
print(f"diff={diff}")
assert diff <= tolerance, f"HE decrypted sum mismatch: actual={actual}, expected={expected}, diff={diff}"
PY

  echo "HE gateway API test PASSED"
} | tee "$OUT"
