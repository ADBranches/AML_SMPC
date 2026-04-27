#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="$ROOT_DIR/tests/evidence/phase7_1/checks"
mkdir -p "$EVIDENCE_DIR"

cd "$ROOT_DIR"

echo "Phase 7.1 Preflight Check"
echo "Project root: $ROOT_DIR"
echo

FAIL=0

check_cmd() {
  local cmd="$1"
  if command -v "$cmd" >/dev/null 2>&1; then
    echo "✅ command available: $cmd"
  else
    echo "❌ command missing: $cmd"
    FAIL=1
  fi
}

check_file() {
  local file="$1"
  if [ -f "$file" ]; then
    echo "✅ file exists: $file"
  else
    echo "❌ file missing: $file"
    FAIL=1
  fi
}

check_dir() {
  local dir="$1"
  if [ -d "$dir" ]; then
    echo "✅ directory exists: $dir"
  else
    echo "❌ directory missing: $dir"
    FAIL=1
  fi
}

echo "Checking required commands..."
check_cmd bash
check_cmd python
check_cmd cargo
check_cmd curl
check_cmd cmake
echo

echo "Checking Phase 7.1 directories..."
check_dir tests/integration
check_dir tests/compliance
check_dir tests/fixtures
check_dir tests/evidence/phase7_1
check_dir scripts/ci
echo

echo "Checking fixture JSON files..."
for json_file in \
  tests/fixtures/he_test_vectors.json \
  tests/fixtures/he_expected_outputs.json \
  tests/fixtures/smpc_test_cases.json \
  tests/fixtures/zk_claim_cases.json \
  tests/fixtures/e2e_transactions.json
do
  check_file "$json_file"
  if [ -f "$json_file" ]; then
    python -m json.tool "$json_file" >/dev/null
    echo "✅ valid JSON: $json_file"
  fi
done
echo

echo "Checking collector script syntax..."
check_file scripts/ci/phase71_collect_route_context.sh
if [ -f scripts/ci/phase71_collect_route_context.sh ]; then
  bash -n scripts/ci/phase71_collect_route_context.sh
  echo "✅ bash syntax valid: scripts/ci/phase71_collect_route_context.sh"
fi
echo

echo "Checking filtered project structure..."
{
  echo "===== top-level ====="
  find . -maxdepth 2 \
    -path './external' -prune -o \
    -path './*/target' -prune -o \
    -path './*/build' -prune -o \
    -print | sort

  echo
  echo "===== services depth 4 ====="
  find services -maxdepth 4 \
    -path '*/target' -prune -o \
    -path '*/build' -prune -o \
    -print | sort
} | tee "$EVIDENCE_DIR/filtered_structure.log" >/dev/null

echo "✅ filtered structure saved: $EVIDENCE_DIR/filtered_structure.log"
echo

if [ "$FAIL" -eq 0 ]; then
  echo "✅ Phase 7.1 preflight passed."
else
  echo "❌ Phase 7.1 preflight failed. Review errors above."
fi

exit "$FAIL"
