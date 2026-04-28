#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC"
AML_ROOT="$REPO_ROOT/aml-system"

cd "$REPO_ROOT"

echo "============================================================"
echo "FINAL-5 PRESENTATION REHEARSAL CHECK"
echo "============================================================"

git fetch origin --prune >/dev/null

SYNC_COUNT="$(git rev-list --left-right --count HEAD...origin/main)"
if [ "$SYNC_COUNT" != "0	0" ] && [ "$SYNC_COUNT" != "0 0" ]; then
  echo "❌ Git is not synced with origin/main: $SYNC_COUNT"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  git status -sb
  echo "❌ Working tree is not clean."
  exit 1
fi

echo "✅ Git is clean and synced."

echo
echo "Running FINAL-4 audit..."
./aml-system/scripts/ci/final-repository-audit.sh

echo
echo "Checking frontend build..."
cd "$AML_ROOT/services/regulator-api/frontend"
npm run build

echo
echo "Checking backend builds..."
cd "$AML_ROOT"
cargo build --manifest-path services/regulator-api/backend/Cargo.toml
cargo build --manifest-path services/smpc-orchestrator/runtime/Cargo.toml

echo
echo "============================================================"
echo "FINAL-5 PRESENTATION REHEARSAL CHECK PASSED"
echo "============================================================"
