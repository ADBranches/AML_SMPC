#!/usr/bin/env bash
set -euo pipefail

ENTITY_ID="${1:?usage: run_mp_spdz_local.sh <entity_id>}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MP_SPDZ_DIR="$ROOT_DIR/external/MP-SPDZ"
PROGRAM_NAME="sanction_check"

if [[ ! -d "$MP_SPDZ_DIR" ]]; then
  echo "[error] MP-SPDZ not found at $MP_SPDZ_DIR" >&2
  exit 1
fi

mkdir -p "$MP_SPDZ_DIR/Programs/Source"
cp "$ROOT_DIR/services/smpc-orchestrator/programs/${PROGRAM_NAME}.mpc" \
   "$MP_SPDZ_DIR/Programs/Source/${PROGRAM_NAME}.mpc"

# Inputs:
# Party 0 -> queried entity id
# Party 1 -> sanction list entries
# Party 2 -> padding/future extension values
mkdir -p "$MP_SPDZ_DIR/Player-Data"

printf '%s\n' "$ENTITY_ID" > "$MP_SPDZ_DIR/Player-Data/Input-P0-0"
printf '1007\n2001\n3009\n' > "$MP_SPDZ_DIR/Player-Data/Input-P1-0"
printf '0\n0\n0\n' > "$MP_SPDZ_DIR/Player-Data/Input-P2-0"

cd "$MP_SPDZ_DIR"

# Compile + run.
# This is the simplest MVP path; adjust protocol later if needed.
./compile.py "$PROGRAM_NAME" >/dev/null

# Typical local execution path for malicious protocol example.
# If your local environment prefers semi2k or another protocol, swap here.
./Scripts/compile-run.py -E mascot "$PROGRAM_NAME" 2>/dev/null | tail -n 1