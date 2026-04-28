#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://127.0.0.1:8085}"
SUPER_EMAIL="${SUPER_EMAIL:-super.admin@aml-smpc.local}"
SUPER_PASSWORD="${SUPER_PASSWORD:-SuperAdmin123}"
DEMO_PASSWORD="${DEMO_PASSWORD:-StrongPass123}"

echo "============================================================"
echo "AUTH-8 DEMO USER SEEDER"
echo "============================================================"

curl -fsS "$API_BASE/health" >/dev/null

SUPER_JSON="$(curl -fsS -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$SUPER_EMAIL\",\"password\":\"$SUPER_PASSWORD\"}")"

SUPER_TOKEN="$(echo "$SUPER_JSON" | jq -r '.token')"

if [ -z "$SUPER_TOKEN" ] || [ "$SUPER_TOKEN" = "null" ]; then
  echo "Failed to login as super admin."
  exit 1
fi

get_user_json() {
  local email="$1"

  curl -fsS "$API_BASE/admin/users" \
    -H "Authorization: Bearer $SUPER_TOKEN" \
    | jq -c --arg email "$email" '.[] | select(.email == $email)' \
    | head -n 1
}

seed_user() {
  local full_name="$1"
  local email="$2"
  local organization="$3"
  local role="$4"
  local reason="$5"

  echo
  echo "Ensuring user: $email -> $role"

  set +e
  REGISTER_RESPONSE="$(curl -sS -w '\n%{http_code}' -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
      \"full_name\":\"$full_name\",
      \"email\":\"$email\",
      \"password\":\"$DEMO_PASSWORD\",
      \"organization_name\":\"$organization\",
      \"requested_role\":\"$role\",
      \"reason_for_access\":\"$reason\"
    }")"
  set -e

  REGISTER_CODE="$(echo "$REGISTER_RESPONSE" | tail -n 1)"
  REGISTER_BODY="$(echo "$REGISTER_RESPONSE" | sed '$d')"

  if [ "$REGISTER_CODE" = "201" ]; then
    echo "Registered pending user."
  elif [ "$REGISTER_CODE" = "409" ]; then
    echo "User already exists."
  else
    echo "Registration returned HTTP $REGISTER_CODE"
    echo "$REGISTER_BODY" | jq . || echo "$REGISTER_BODY"
  fi

  USER_JSON="$(get_user_json "$email")"

  USER_ID="$(echo "$USER_JSON" | jq -r '.user_id // empty')"
  CURRENT_STATUS="$(echo "$USER_JSON" | jq -r '.account_status // empty')"
  CURRENT_ROLE="$(echo "$USER_JSON" | jq -r '.role // empty')"

  if [ -z "$USER_ID" ]; then
    echo "Could not find user after registration: $email"
    exit 1
  fi

  if [ "$CURRENT_STATUS" = "pending_approval" ]; then
    curl -fsS -X POST "$API_BASE/admin/users/$USER_ID/approve" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $SUPER_TOKEN" \
      -d "{\"assigned_role\":\"$role\"}" >/dev/null
    echo "Approved user as $role."
  elif [ "$CURRENT_STATUS" != "active" ] || [ "$CURRENT_ROLE" != "$role" ]; then
    curl -fsS -X POST "$API_BASE/admin/users/$USER_ID/activate" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $SUPER_TOKEN" \
      -d "{\"assigned_role\":\"$role\"}" >/dev/null
    echo "Activated/reassigned user as $role."
  else
    echo "User already active with correct role."
  fi

  LOGIN_JSON="$(curl -fsS -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$DEMO_PASSWORD\"}")"

  echo "$LOGIN_JSON" | jq '{email, role, account_status, permissions}'
}

seed_user \
  "Demo Institution Admin" \
  "demo.institution.admin@example.com" \
  "Demo Origin Bank" \
  "institution_admin" \
  "I need institution admin access to supervise transaction submission, review, screening, and proof generation."

seed_user \
  "Demo Submitter" \
  "demo.submitter@example.com" \
  "Demo Origin Bank" \
  "transaction_submitter" \
  "I need access to submit synthetic AML transactions for compliance testing."

seed_user \
  "Demo Reviewer" \
  "demo.reviewer@example.com" \
  "Demo Origin Bank" \
  "transaction_reviewer" \
  "I need reviewer access to approve institution AML transactions."

seed_user \
  "Demo Regulator" \
  "demo.regulator@example.com" \
  "Demo Regulator Authority" \
  "regulator" \
  "I need regulator access to verify AML proof and audit evidence."

seed_user \
  "Demo Auditor" \
  "demo.auditor@example.com" \
  "Demo Audit Office" \
  "auditor" \
  "I need read-only audit and compliance evidence access."

echo
echo "============================================================"
echo "AUTH-8 DEMO USERS READY"
echo "============================================================"
echo "super_admin:           super.admin@aml-smpc.local / $SUPER_PASSWORD"
echo "institution_admin:     demo.institution.admin@example.com / $DEMO_PASSWORD"
echo "transaction_submitter: demo.submitter@example.com / $DEMO_PASSWORD"
echo "transaction_reviewer:  demo.reviewer@example.com / $DEMO_PASSWORD"
echo "regulator:             demo.regulator@example.com / $DEMO_PASSWORD"
echo "auditor:               demo.auditor@example.com / $DEMO_PASSWORD"
