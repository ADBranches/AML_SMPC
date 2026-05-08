#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://127.0.0.1:8085}"
PASSWORD="${PASSWORD:-StrongPass123}"
SUPER_EMAIL="${SUPER_EMAIL:-super.admin@aml-smpc.local}"
SUPER_PASSWORD="${SUPER_PASSWORD:-SuperAdmin123}"

echo "============================================================"
echo "STAGE 9A — BANK RBAC IDENTITY VALIDATION"
echo "============================================================"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "❌ Missing required command: $1"
    exit 1
  }
}

require_cmd curl
require_cmd jq

echo
echo "=== API health ==="
curl -fsS "$API_BASE/health" | jq .

echo
echo "=== Non-partner bank registration must fail ==="
BAD_EMAIL="bad.partner.$(date +%s)@example.com"

BAD_RESPONSE="$(curl -sS -w '\nHTTP_STATUS=%{http_code}\n' -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"full_name\": \"Bad Partner User\",
    \"email\": \"$BAD_EMAIL\",
    \"password\": \"$PASSWORD\",
    \"partner_bank_code\": \"NOT_A_PARTNER\",
    \"bank_employee_id\": \"BAD-001\",
    \"department\": \"Compliance\",
    \"job_title\": \"AML Analyst\",
    \"requested_role\": \"transaction_submitter\",
    \"reason_for_access\": \"Testing rejection for invalid partner organization code.\"
  }")"

echo "$BAD_RESPONSE"

echo "$BAD_RESPONSE" | grep -q "HTTP_STATUS=400"
echo "$BAD_RESPONSE" | grep -q "invalid_partner_bank_code"

echo "✅ non-partner bank registration fails with HTTP 400"

echo
echo "=== Partner bank registration succeeds as pending_approval ==="
GOOD_EMAIL="stage9.partner.$(date +%s)@example.com"

GOOD_RESPONSE="$(curl -fsS -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"full_name\": \"Stage9 Partner User\",
    \"email\": \"$GOOD_EMAIL\",
    \"password\": \"$PASSWORD\",
    \"partner_bank_code\": \"BANK_A_UG\",
    \"bank_employee_id\": \"BANKA-STAGE9-$(date +%s)\",
    \"department\": \"Compliance\",
    \"job_title\": \"AML Analyst\",
    \"requested_role\": \"transaction_submitter\",
    \"reason_for_access\": \"Testing approved partner bank registration and RBAC identity.\"
  }")"

echo "$GOOD_RESPONSE" | jq .

USER_ID="$(echo "$GOOD_RESPONSE" | jq -r '.user_id')"
ACCOUNT_STATUS="$(echo "$GOOD_RESPONSE" | jq -r '.account_status')"
PARTNER_CODE="$(echo "$GOOD_RESPONSE" | jq -r '.partner_bank_code')"

test "$ACCOUNT_STATUS" = "pending_approval"
test "$PARTNER_CODE" = "BANK_A_UG"

echo "✅ partner bank registration succeeds as pending_approval"

echo
echo "=== Super admin login ==="
SUPER_JSON="$(curl -fsS -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$SUPER_EMAIL\",
    \"password\": \"$SUPER_PASSWORD\"
  }")"

SUPER_TOKEN="$(echo "$SUPER_JSON" | jq -r '.token')"

test "$SUPER_TOKEN" != "null"
test -n "$SUPER_TOKEN"

echo "$SUPER_JSON" | jq '{email, role, organization_id, permissions}'

echo
echo "=== Super admin approval activates account ==="
APPROVED_JSON="$(curl -fsS -X POST "$API_BASE/admin/users/$USER_ID/approve" \
  -H "Authorization: Bearer $SUPER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"assigned_role":"transaction_submitter"}')"

echo "$APPROVED_JSON" | jq .

echo "$APPROVED_JSON" | jq -e '.account_status == "active" or .status == "active"' >/dev/null

echo "✅ super admin approval activates account"

echo
echo "=== Approved user JWT contains organization_id, role, and permissions ==="
USER_JSON="$(curl -fsS -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$GOOD_EMAIL\",
    \"password\": \"$PASSWORD\"
  }")"

echo "$USER_JSON" | jq '{email, role, organization_id, permissions, token_present: (.token != null)}'

echo "$USER_JSON" | jq -e '.organization_id != null' >/dev/null
echo "$USER_JSON" | jq -e '.role == "transaction_submitter"' >/dev/null
echo "$USER_JSON" | jq -e '.permissions | index("transactions:create") != null' >/dev/null

echo "✅ JWT/session contains organization_id, role, and permissions"

echo
echo "============================================================"
echo "BANK RBAC IDENTITY VALIDATION PASSED"
echo "============================================================"
