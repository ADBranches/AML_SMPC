#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

source "$ROOT_DIR/tests/integration/lib_phase71.sh"

phase71_load_env
phase71_require_common
phase71_require_cmd psql

echo "============================================================"
echo "AML SMPC BACKEND FOR FRONTEND DEMO"
echo "============================================================"

echo
echo "Starting required backend services..."

phase71_start_he_gateway
phase71_start_smpc_runtime
phase71_start_encryption_service
phase71_start_zk_prover
phase71_start_regulator_api

echo
echo "Backend services are ready:"
echo "encryption-service: http://127.0.0.1:8081"
echo "he-orchestrator:     http://127.0.0.1:8082"
echo "smpc-orchestrator:  http://127.0.0.1:8083"
echo "zk-prover:          http://127.0.0.1:8084"
echo "regulator-api:      http://127.0.0.1:8085"

echo
echo "Frontend should use:"
echo "VITE_REGULATOR_API_BASE_URL=/api/regulator"
echo "VITE_ENCRYPTION_API_BASE_URL=/api/encryption"
echo "VITE_HE_API_BASE_URL=/api/he"
echo "VITE_SMPC_API_BASE_URL=/api/smpc"
echo "VITE_ZK_PROVER_BASE_URL=/api/zk"

echo
echo "Keep this terminal open while using the frontend."
echo "Press Ctrl+C to stop services started by this script."

while true; do
  sleep 3600
done
