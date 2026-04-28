#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REPO_ROOT="$(cd "$ROOT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "============================================================"
echo "FINAL-4 REPOSITORY AUDIT"
echo "============================================================"

pass() {
  echo "✅ $1"
}

fail() {
  echo "❌ $1"
  exit 1
}

check_file() {
  local file="$1"

  if [ -f "$file" ]; then
    pass "found $file"
  else
    fail "missing $file"
  fi
}

check_executable() {
  local file="$1"

  if [ -x "$file" ]; then
    pass "executable $file"
  else
    fail "not executable $file"
  fi
}

echo
echo "Checking Git sync..."

git fetch origin --prune >/dev/null

SYNC_COUNT="$(git rev-list --left-right --count HEAD...origin/main)"
if [ "$SYNC_COUNT" = "0	0" ] || [ "$SYNC_COUNT" = "0 0" ]; then
  pass "local main is synced with origin/main"
else
  fail "git sync mismatch: $SYNC_COUNT"
fi

if [ "${ALLOW_DIRTY:-0}" = "1" ]; then
  echo "⚠️ ALLOW_DIRTY=1 set, skipping clean working tree enforcement."
else
  if [ -z "$(git status --porcelain)" ]; then
    pass "working tree is clean"
  else
    git status -sb
    fail "working tree is not clean"
  fi
fi

echo
echo "Checking Git remote safety..."

REMOTE_URL="$(git remote get-url origin)"

if echo "$REMOTE_URL" | grep -Eq 'ghp_|github_pat_|[A-Za-z0-9_]+@github.com'; then
  fail "origin remote appears to contain a credential/token"
else
  pass "origin remote does not expose a token"
fi

echo
echo "Checking release tags..."

if git rev-parse final-demo-ready-v1 >/dev/null 2>&1; then
  pass "release tag final-demo-ready-v1 exists"
else
  echo "⚠️ final-demo-ready-v1 tag not found. Create it if required."
fi

echo
echo "Checking required scripts..."

check_executable "aml-system/scripts/demo/run-frontend-backend.sh"
check_executable "aml-system/scripts/demo/run-three-bank-smpc-demo.sh"
check_executable "aml-system/scripts/demo/run-demo1-final-objective-validation.sh"
check_executable "aml-system/scripts/dev/seed_auth8_demo_users.sh"
check_executable "aml-system/scripts/ci/validate-auth8-rbac-demo.sh"

echo
echo "Checking required evidence and documentation..."

check_file "aml-system/docs/demo/DEMO_1_FINAL_OBJECTIVE_VALIDATION_RESULTS.md"
check_file "aml-system/docs/auth/AUTH_8_RBAC_VALIDATION_RESULTS.md"
check_file "aml-system/docs/auth/auth8-rbac-access-matrix.md"
check_file "aml-system/docs/demo/FINAL_PROJECT_PRESENTATION_RUNBOOK.md"
check_file "aml-system/docs/demo/FINAL_PROJECT_OBJECTIVE_VALIDATION_MATRIX.md"
check_file "aml-system/docs/demo/THREE_BANK_SMPC_COLLABORATION_MODEL.md"
check_file "aml-system/docs/demo/THREE_BANK_SMPC_DEMO_SCRIPT.md"
check_file "aml-system/docs/defense/FINAL_PRESENTATION_STORY.md"
check_file "aml-system/docs/defense/EXAMINER_DEFENSE_NOTES.md"
check_file "aml-system/docs/defense/FINAL_DEMO_TALK_TRACK.md"
check_file "aml-system/tests/evidence/three_bank_smpc/THREE_BANK_SMPC_EVIDENCE_SUMMARY.md"

echo
echo "Checking validation result text..."

grep -q "PASSED" aml-system/docs/demo/DEMO_1_FINAL_OBJECTIVE_VALIDATION_RESULTS.md \
  && pass "DEMO-1 result says PASSED" \
  || fail "DEMO-1 result does not say PASSED"

grep -q "PASSED" aml-system/docs/auth/AUTH_8_RBAC_VALIDATION_RESULTS.md \
  && pass "AUTH-8 result says PASSED" \
  || fail "AUTH-8 result does not say PASSED"

grep -q "PASSED" aml-system/tests/evidence/three_bank_smpc/THREE_BANK_SMPC_EVIDENCE_SUMMARY.md \
  && pass "BANK-1 result says PASSED" \
  || fail "BANK-1 result does not say PASSED"

echo
echo "Checking source route compatibility..."

grep -q '"/smpc/three-bank-screen"' aml-system/services/smpc-orchestrator/runtime/src/main.rs \
  && pass "three-bank SMPC endpoint exists" \
  || fail "three-bank SMPC endpoint missing"

grep -q '"/smpc/screen"' aml-system/services/smpc-orchestrator/runtime/src/main.rs \
  && pass "legacy SMPC screening compatibility endpoint exists" \
  || fail "legacy SMPC screening compatibility endpoint missing"

grep -q '"screening_result": "clear"' aml-system/services/smpc-orchestrator/runtime/src/main.rs \
  && pass "SMPC compatibility response includes screening_result" \
  || fail "SMPC compatibility response missing screening_result"

grep -q '"entity_id": entity_id' aml-system/services/smpc-orchestrator/runtime/src/main.rs \
  && pass "SMPC compatibility response includes entity_id" \
  || fail "SMPC compatibility response missing entity_id"

echo
echo "============================================================"
echo "FINAL-4 REPOSITORY AUDIT PASSED"
echo "============================================================"
