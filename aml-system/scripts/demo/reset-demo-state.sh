#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

source "$ROOT_DIR/tests/integration/lib_phase71.sh"

phase71_load_env
phase71_require_cmd psql

psql_url="$(phase71_psql_url)"

echo "Resetting AML SMPC demo state..."

psql "$psql_url" -v ON_ERROR_STOP=1 \
  -c "DELETE FROM proofs WHERE tx_id LIKE 'TX-PHASE71-%' OR tx_id LIKE 'TX-PHASE72-%' OR tx_id LIKE 'TX-PHASE73-%' OR tx_id LIKE 'TX-PERF72-%';" \
  -c "DELETE FROM audit_logs WHERE tx_id LIKE 'TX-PHASE71-%' OR tx_id LIKE 'TX-PHASE72-%' OR tx_id LIKE 'TX-PHASE73-%' OR tx_id LIKE 'TX-PERF72-%';" \
  -c "DELETE FROM transactions WHERE tx_id LIKE 'TX-PHASE71-%' OR tx_id LIKE 'TX-PHASE72-%' OR tx_id LIKE 'TX-PHASE73-%' OR tx_id LIKE 'TX-PERF72-%';"

echo "Demo state reset complete."
