#!/usr/bin/env bash
set -euo pipefail

REGULATOR_API_BASE_URL="${REGULATOR_API_BASE_URL:-http://127.0.0.1:8085}"
TX_ID="${1:-TX-PHASE73-R16-001}"

command -v curl >/dev/null 2>&1 || { echo "curl is required"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq is required"; exit 1; }

echo "Frontend API smoke check"
echo "Regulator API: $REGULATOR_API_BASE_URL"
echo "Transaction ID: $TX_ID"

echo
echo "1. Regulator API health"
curl -fsS "$REGULATOR_API_BASE_URL/health" | jq .

echo
echo "2. List proofs"
proofs_json="$(curl -fsS "$REGULATOR_API_BASE_URL/proofs?tx_id=$TX_ID")"
printf "%s\n" "$proofs_json" | jq .

PROOF_ID="$(printf "%s\n" "$proofs_json" | jq -r '.[0].id // empty')"

if [ -z "$PROOF_ID" ] || [ "$PROOF_ID" = "null" ]; then
  echo "No proof ID found for tx_id=$TX_ID"
  exit 1
fi

echo
echo "3. Proof detail"
proof_detail_json="$(curl -fsS "$REGULATOR_API_BASE_URL/proofs/$PROOF_ID")"
printf "%s\n" "$proof_detail_json" | jq .

echo
echo "4. Verify proof"
verify_json="$(curl -fsS -X POST "$REGULATOR_API_BASE_URL/proofs/$PROOF_ID/verify")"
printf "%s\n" "$verify_json" | jq .
printf "%s\n" "$verify_json" | jq -e '.verified == true' >/dev/null

echo
echo "5. Audit timeline"
audit_json="$(curl -fsS "$REGULATOR_API_BASE_URL/audit/$TX_ID")"
printf "%s\n" "$audit_json" | jq .

echo
echo "Frontend API smoke check passed"
