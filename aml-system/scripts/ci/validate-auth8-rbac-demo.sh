#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://127.0.0.1:8085}"
PASSWORD="${PASSWORD:-StrongPass123}"
SUPER_PASSWORD="${SUPER_PASSWORD:-SuperAdmin123}"
RESULTS_FILE="docs/auth/AUTH_8_RBAC_VALIDATION_RESULTS.md"

mkdir -p docs/auth

pass() {
  echo "✅ $1"
}

fail() {
  echo "❌ $1"
  exit 1
}

login_or_fail() {
  local email="$1"
  local password="$2"

  set +e
  RESPONSE="$(curl -sS -w '\n%{http_code}' -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}")"
  set -e

  CODE="$(echo "$RESPONSE" | tail -n 1)"
  BODY="$(echo "$RESPONSE" | sed '$d')"

  if [ "$CODE" != "200" ]; then
    echo "Login failed for $email with HTTP $CODE"
    echo "$BODY" | jq . || echo "$BODY"
    exit 1
  fi

  echo "$BODY"
}

http_code() {
  local method="$1"
  local url="$2"
  local token="$3"
  local body="${4:-}"

  if [ -n "$body" ]; then
    curl -sS -o /tmp/auth8_response.json -w "%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$body"
  else
    curl -sS -o /tmp/auth8_response.json -w "%{http_code}" -X "$method" "$url" \
      -H "Authorization: Bearer $token"
  fi
}

expect_code() {
  local actual="$1"
  local expected="$2"
  local label="$3"

  if [ "$actual" = "$expected" ]; then
    pass "$label"
  else
    echo "Response body:"
    cat /tmp/auth8_response.json | jq . || cat /tmp/auth8_response.json
    fail "$label expected HTTP $expected but got HTTP $actual"
  fi
}

echo "============================================================"
echo "AUTH-8 RBAC VALIDATION"
echo "============================================================"

curl -fsS "$API_BASE/health" >/dev/null
pass "regulator API health check"

SUPER_JSON="$(login_or_fail super.admin@aml-smpc.local "$SUPER_PASSWORD")"
INST_ADMIN_JSON="$(login_or_fail demo.institution.admin@example.com "$PASSWORD")"
SUBMITTER_JSON="$(login_or_fail demo.submitter@example.com "$PASSWORD")"
REVIEWER_JSON="$(login_or_fail demo.reviewer@example.com "$PASSWORD")"
REGULATOR_JSON="$(login_or_fail demo.regulator@example.com "$PASSWORD")"
AUDITOR_JSON="$(login_or_fail demo.auditor@example.com "$PASSWORD")"

SUPER_TOKEN="$(echo "$SUPER_JSON" | jq -r '.token')"
SUBMITTER_TOKEN="$(echo "$SUBMITTER_JSON" | jq -r '.token')"
REVIEWER_TOKEN="$(echo "$REVIEWER_JSON" | jq -r '.token')"
REGULATOR_TOKEN="$(echo "$REGULATOR_JSON" | jq -r '.token')"
AUDITOR_TOKEN="$(echo "$AUDITOR_JSON" | jq -r '.token')"

[ "$(echo "$SUPER_JSON" | jq -r '.role')" = "super_admin" ] || fail "super_admin role mismatch"
[ "$(echo "$INST_ADMIN_JSON" | jq -r '.role')" = "institution_admin" ] || fail "institution_admin role mismatch"
[ "$(echo "$SUBMITTER_JSON" | jq -r '.role')" = "transaction_submitter" ] || fail "submitter role mismatch"
[ "$(echo "$REVIEWER_JSON" | jq -r '.role')" = "transaction_reviewer" ] || fail "reviewer role mismatch"
[ "$(echo "$REGULATOR_JSON" | jq -r '.role')" = "regulator" ] || fail "regulator role mismatch"
[ "$(echo "$AUDITOR_JSON" | jq -r '.role')" = "auditor" ] || fail "auditor role mismatch"
pass "all demo users login with expected roles"

CODE="$(http_code GET "$API_BASE/admin/users" "$SUPER_TOKEN")"
expect_code "$CODE" "200" "super_admin can access user management"

CODE="$(http_code GET "$API_BASE/admin/users" "$SUBMITTER_TOKEN")"
expect_code "$CODE" "403" "submitter cannot access user management"

TX_ID="TX-AUTH8-$(date -u +%Y%m%d%H%M%S)"

CREATE_BODY="{
  \"tx_id\":\"$TX_ID\",
  \"sender_id\":\"AUTH8-SENDER-1001\",
  \"receiver_id\":\"AUTH8-RECEIVER-2002\",
  \"sender_entity_id\":1001,
  \"receiver_entity_id\":2002,
  \"amount\":2250,
  \"currency\":\"USD\",
  \"transaction_type\":\"wire_transfer\",
  \"originator_name\":\"AUTH8 Sender\",
  \"beneficiary_name\":\"AUTH8 Receiver\",
  \"originator_institution\":\"AUTH8 Origin Bank\",
  \"beneficiary_institution\":\"AUTH8 Beneficiary Bank\",
  \"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
}"

CODE="$(http_code POST "$API_BASE/transactions" "$SUBMITTER_TOKEN" "$CREATE_BODY")"
expect_code "$CODE" "201" "submitter can create transaction workflow"

CODE="$(http_code POST "$API_BASE/transactions/$TX_ID/approve" "$SUBMITTER_TOKEN" '{"note":"Should fail."}')"
expect_code "$CODE" "403" "submitter cannot approve transaction"

CODE="$(http_code POST "$API_BASE/transactions/$TX_ID/approve" "$REVIEWER_TOKEN" '{"note":"Approved for AUTH-8 validation."}')"
expect_code "$CODE" "200" "reviewer can approve transaction"

CODE="$(http_code POST "$API_BASE/transactions/$TX_ID/run-screening" "$REVIEWER_TOKEN")"
expect_code "$CODE" "200" "reviewer can run screening"

CODE="$(http_code POST "$API_BASE/transactions/$TX_ID/generate-proofs" "$REVIEWER_TOKEN")"
expect_code "$CODE" "200" "reviewer can generate proofs"

CODE="$(http_code GET "$API_BASE/proofs?tx_id=$TX_ID" "$SUBMITTER_TOKEN")"
expect_code "$CODE" "403" "submitter cannot read regulator proofs"

CODE="$(http_code GET "$API_BASE/proofs?tx_id=$TX_ID" "$REGULATOR_TOKEN")"
expect_code "$CODE" "200" "regulator can read proofs"

PROOF_COUNT="$(cat /tmp/auth8_response.json | jq 'length')"
[ "$PROOF_COUNT" -ge 3 ] || fail "expected at least 3 proofs, got $PROOF_COUNT"
pass "proof count is at least 3"

PROOF_ID="$(cat /tmp/auth8_response.json | jq -r '.[0].id')"

CODE="$(http_code GET "$API_BASE/audit/$TX_ID" "$REGULATOR_TOKEN")"
expect_code "$CODE" "200" "regulator can read audit"

AUDIT_COUNT="$(cat /tmp/auth8_response.json | jq 'length')"
[ "$AUDIT_COUNT" -ge 3 ] || fail "expected at least 3 audit events, got $AUDIT_COUNT"
pass "audit count is at least 3"

CODE="$(http_code GET "$API_BASE/proofs?tx_id=$TX_ID" "$AUDITOR_TOKEN")"
expect_code "$CODE" "200" "auditor can read proofs"

CODE="$(http_code POST "$API_BASE/proofs/$PROOF_ID/verify" "$AUDITOR_TOKEN")"
expect_code "$CODE" "403" "auditor cannot verify proofs"

CODE="$(http_code POST "$API_BASE/proofs/$PROOF_ID/verify" "$REGULATOR_TOKEN")"
expect_code "$CODE" "200" "regulator can verify proofs"

cat > "$RESULTS_FILE" <<RESULTS
# AUTH-8 RBAC Validation Results

## Result

PASSED

## Transaction Tested

\`$TX_ID\`

## Evidence Counts

- Proof count: $PROOF_COUNT
- Audit count: $AUDIT_COUNT

## Verified Capabilities

- super_admin can manage users.
- transaction_submitter can create transaction workflow requests.
- transaction_submitter cannot approve transactions.
- transaction_reviewer can approve transactions.
- transaction_reviewer can run SMPC screening.
- transaction_reviewer can trigger proof generation.
- transaction_submitter cannot access regulator proofs.
- regulator can read proofs.
- regulator can read audit timeline.
- regulator can verify proofs.
- auditor can read proofs.
- auditor cannot verify proofs.
RESULTS

echo
echo "============================================================"
echo "AUTH-8 RBAC VALIDATION PASSED"
echo "Evidence written to: $RESULTS_FILE"
echo "============================================================"
