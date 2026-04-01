#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENCRYPTION_SERVICE_BASE_URL="${ENCRYPTION_SERVICE_BASE_URL:-http://127.0.0.1:8081}"
ZK_PROVER_BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"

cd "$ROOT_DIR/tests/performance"
echo "[phase7] starting transaction throughput load test against $ENCRYPTION_SERVICE_BASE_URL"
ENCRYPTION_SERVICE_BASE_URL="$ENCRYPTION_SERVICE_BASE_URL" ZK_PROVER_BASE_URL="$ZK_PROVER_BASE_URL"   locust -f locustfile.py TransactionUser --headless -u 20 -r 5 -t 30s --host "$ENCRYPTION_SERVICE_BASE_URL"

echo "[phase7] starting proof generation load test against $ZK_PROVER_BASE_URL"
ENCRYPTION_SERVICE_BASE_URL="$ENCRYPTION_SERVICE_BASE_URL" ZK_PROVER_BASE_URL="$ZK_PROVER_BASE_URL"   locust -f locustfile.py ProofUser --headless -u 10 -r 2 -t 30s --host "$ZK_PROVER_BASE_URL"
