#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

export DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5434/aml_dev}"

echo "[demo] Phase 7 validation sequence starting"

echo "[demo] Step 1/3: Phase 7.1 functional + integration"
bash "$ROOT_DIR/scripts/demo/run_phase7_1.sh"

echo "[demo] Step 2/3: Phase 7.3 compliance validation"
bash "$ROOT_DIR/scripts/demo/run_phase7_3.sh"

echo "[demo] Step 3/3: Phase 7.2 performance validation"
bash "$ROOT_DIR/scripts/demo/run_phase7_2.sh"

echo "[demo] Phase 7 validation sequence completed"
