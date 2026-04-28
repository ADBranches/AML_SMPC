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

get_user_field() {
  local email="$1"
  local field="$2"

  curl -fsS "$API_BASE/admin/users" \
    -H "Authorization: Bearer $SUPER_TOKEN" \
    | jq -r --arg email "$email" --arg field "$field" '.[] | select(.email == $email) | .[$field]' \
    | head -n 1
}

seed_user() {
  local full_name="$1"
  local email="$2"
  local organization="$3"
  local role="$4"
  local reason="$5"

  echo
  echo "Ensuring $email as $role"

  set +e
  REGISTER_CODE="$(curl -sS -o /tmp/auth8_register.json -w "%{http_code}" \
    -X POST "$API_BASE/auth/register" \
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

  if [ "$REGISTER_CODE" = "201" ]; then
    echo "Registered pending user."
  elif [ "$REGISTER_CODE" = "409" ]; then
    echo "User already exists."
  else
    echo "Registration returned HTTP $REGISTER_CODE"
    cat /tmp/auth8_register.json | jq . || cat /tmp/auth8_register.json
  fi

  USER_ID="$(get_user_field "$email" "user_id")"
  STATUS="$(get_user_field "$email" "account_status")"
  CURRENT_ROLE="$(get_user_field "$email" "role")"

  if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
    echo "Could not find user: $email"
    exit 1
  fi

  if [ "$STATUS" = "pending_approval" ]; then
    curl -fsS -X POST "$API_BASE/admin/users/$USER_ID/approve" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $SUPER_TOKEN" \
      -d "{\"assigned_role\":\"$role\"}" >/dev/null
    echo "Approved as $role."
  elif [ "$STATUS" != "active" ] || [ "$CURRENT_ROLE" != "$role" ]; then
    curl -fsS -X POST "$API_BASE/admin/users/$USER_ID/activate" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $SUPER_TOKEN" \
      -d "{\"assigned_role\":\"$role\"}" >/dev/null
    echo "Activated/reassigned as $role."
  else
    echo "Already active as $role."
  fi

  curl -fsS -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$DEMO_PASSWORD\"}" \
    | jq '{email, role, account_status, permissions}'
}

seed_user "Demo Institution Admin" "demo.institution.admin@example.com" "Demo Origin Bank" "institution_admin" "Institution admin access for demo workflow supervision."
seed_user "Demo Submitter" "demo.submitter@example.com" "Demo Origin Bank" "transaction_submitter" "Submitter access for AML transaction workflow testing."
seed_user "Demo Reviewer" "demo.reviewer@example.com" "Demo Origin Bank" "transaction_reviewer" "Reviewer access for approval, screening, and proof generation."
seed_user "Demo Regulator" "demo.regulator@example.com" "Demo Regulator Authority" "regulator" "Regulator access for proof and audit verification."
seed_user "Demo Auditor" "demo.auditor@example.com" "Demo Audit Office" "auditor" "Read-only audit and compliance evidence access."

echo
echo "============================================================"
echo "AUTH-8 DEMO USERS READY"
echo "============================================================"
