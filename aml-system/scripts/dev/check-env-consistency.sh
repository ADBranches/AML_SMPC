#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE_FILE="$ROOT_DIR/.env.example"
MAKEFILE="$ROOT_DIR/Makefile"

require_file() {
  [[ -f "$1" ]] || { echo "[error] missing file: $1"; exit 1; }
}

extract_var_from_file() {
  local file="$1" key="$2"
  grep -E "^${key}=" "$file" | tail -n1 | cut -d'=' -f2-
}

require_file "$ENV_FILE"
require_file "$ENV_EXAMPLE_FILE"
require_file "$MAKEFILE"

ENV_DB="$(extract_var_from_file "$ENV_FILE" DATABASE_URL)"
ENV_EXAMPLE_DB="$(extract_var_from_file "$ENV_EXAMPLE_FILE" DATABASE_URL)"
ENV_SOFTHSM="$(extract_var_from_file "$ENV_FILE" SOFTHSM2_CONF)"
ENV_EXAMPLE_SOFTHSM="$(extract_var_from_file "$ENV_EXAMPLE_FILE" SOFTHSM2_CONF)"
ENV_RUST_LOG="$(extract_var_from_file "$ENV_FILE" RUST_LOG)"
ENV_EXAMPLE_RUST_LOG="$(extract_var_from_file "$ENV_EXAMPLE_FILE" RUST_LOG)"
MAKE_DB_PORT="$(grep -E '^DB_PORT \?=' "$MAKEFILE" | awk '{print $3}')"

fail=0

if [[ -z "$ENV_DB" || -z "$ENV_EXAMPLE_DB" ]]; then
  echo "[error] DATABASE_URL missing from .env or .env.example"
  fail=1
fi

if [[ "$ENV_DB" != "$ENV_EXAMPLE_DB" ]]; then
  echo "[error] DATABASE_URL mismatch"
  echo "  .env         = $ENV_DB"
  echo "  .env.example = $ENV_EXAMPLE_DB"
  fail=1
fi

if [[ "$ENV_SOFTHSM" != "$ENV_EXAMPLE_SOFTHSM" ]]; then
  echo "[error] SOFTHSM2_CONF mismatch"
  fail=1
fi

if [[ "$ENV_RUST_LOG" != "$ENV_EXAMPLE_RUST_LOG" ]]; then
  echo "[error] RUST_LOG mismatch"
  fail=1
fi

if [[ "$ENV_DB" != *":${MAKE_DB_PORT}/"* ]]; then
  echo "[error] Makefile DB_PORT ($MAKE_DB_PORT) does not match DATABASE_URL ($ENV_DB)"
  fail=1
fi

for script in "$ROOT_DIR"/scripts/demo/*.sh "$ROOT_DIR"/scripts/ci/*.sh; do
  [[ -f "$script" ]] || continue
  if grep -q 'localhost:5433' "$script"; then
    echo "[error] stale 5433 reference in $script"
    fail=1
  fi
  if grep -q 'localhost:5432' "$script"; then
    echo "[warn] found direct 5432 reference in $script (check if intentional)"
  fi
done

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi

echo "[ok] environment consistency checks passed"