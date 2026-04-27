#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

source "$ROOT_DIR/tests/integration/lib_phase71.sh"

phase71_load_env
phase71_require_common
phase71_require_cmd locust
phase71_require_cmd psql
phase71_require_cmd python3

EVIDENCE_DIR="$ROOT_DIR/tests/evidence/phase7_2"
mkdir -p "$EVIDENCE_DIR"

TRANSACTION_USERS="${PHASE72_TRANSACTION_USERS:-200}"
TRANSACTION_SPAWN_RATE="${PHASE72_TRANSACTION_SPAWN_RATE:-200}"
TRANSACTION_TARGET="${PHASE72_TOTAL_TRANSACTIONS:-1000}"

PROOF_USERS="${PHASE72_PROOF_USERS:-20}"
PROOF_SPAWN_RATE="${PHASE72_PROOF_SPAWN_RATE:-20}"
PROOF_TARGET="${PHASE72_TOTAL_PROOF_REQUESTS:-100}"

ENCRYPTION_URL="${ENCRYPTION_SERVICE_BASE_URL:-http://127.0.0.1:8081}"
ZK_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"

psql_url="$(phase71_psql_url)"

phase72_clean_transaction_dataset() {
  echo "Cleaning Phase 7.2 transaction dataset from DB..."

  psql "$psql_url" -v ON_ERROR_STOP=1 \
    -c "DELETE FROM proofs WHERE tx_id LIKE 'TX-PERF72-%';" \
    -c "DELETE FROM audit_logs WHERE tx_id LIKE 'TX-PERF72-%';" \
    -c "DELETE FROM transactions WHERE tx_id LIKE 'TX-PERF72-%';"
}

phase72_seed_proof_transactions() {
  echo "Seeding Phase 7.2 proof-generation transactions..."

  local tx_ids=()

  for i in $(seq -w 1 50); do
    tx_ids+=("TX-PERF72-PROOF-$i")
  done

  psql "$psql_url" -v ON_ERROR_STOP=1 \
    -c "DELETE FROM proofs WHERE tx_id LIKE 'TX-PERF72-PROOF-%';" \
    -c "DELETE FROM audit_logs WHERE tx_id LIKE 'TX-PERF72-PROOF-%';" \
    -c "DELETE FROM transactions WHERE tx_id LIKE 'TX-PERF72-PROOF-%';"

  for tx_id in "${tx_ids[@]}"; do
    audit_id_1="$(python3 -c "import uuid; print(uuid.uuid4())")"
    audit_id_2="$(python3 -c "import uuid; print(uuid.uuid4())")"
    audit_id_3="$(python3 -c "import uuid; print(uuid.uuid4())")"

    psql "$psql_url" -v ON_ERROR_STOP=1 \
      -c "INSERT INTO transactions (tx_id, sender_pseudo, receiver_pseudo, amount_cipher_ref, currency, transaction_type, originator_institution, beneficiary_institution, status, created_at) VALUES ('$tx_id', 'psd_perf_sender', 'psd_perf_receiver', NULL, 'USD', 'wire_transfer', 'Phase72 Origin Bank', 'Phase72 Beneficiary Bank', 'screened_clear', NOW());" \
      -c "INSERT INTO audit_logs (id, tx_id, event_type, event_status, event_ref, details, created_at) VALUES ('$audit_id_1'::uuid, '$tx_id', 'transaction_submitted_and_pseudonymized', 'success', NULL, '{\"phase\":\"7.2\",\"source\":\"performance_seed\"}'::jsonb, NOW()), ('$audit_id_2'::uuid, '$tx_id', 'sender_screening_completed', 'no_match', '2001', '{\"entity_id\":2001,\"screening_result\":\"no_match\"}'::jsonb, NOW()), ('$audit_id_3'::uuid, '$tx_id', 'receiver_screening_completed', 'no_match', '2002', '{\"entity_id\":2002,\"screening_result\":\"no_match\"}'::jsonb, NOW());"
  done

  printf "%s" "$(IFS=,; echo "${tx_ids[*]}")" > "$EVIDENCE_DIR/proof_tx_ids.txt"
}

phase72_run_transactions() {
  echo
  echo "============================================================"
  echo "Phase 7.2 Transaction Throughput Benchmark"
  echo "============================================================"

  phase72_clean_transaction_dataset
  phase71_start_smpc_runtime
  phase71_start_encryption_service

  rm -f "$EVIDENCE_DIR"/transactions_*

  local started ended
  started="$(date +%s.%N)"

  PHASE72_SCENARIO=transactions \
  PHASE72_TOTAL_TRANSACTIONS="$TRANSACTION_TARGET" \
  locust \
    -f tests/performance/locustfile.py \
    --headless \
    --host "$ENCRYPTION_URL" \
    -u "$TRANSACTION_USERS" \
    -r "$TRANSACTION_SPAWN_RATE" \
    --run-time 30s \
    --csv "$EVIDENCE_DIR/transactions" \
    --html "$EVIDENCE_DIR/transactions_report.html" \
    --logfile "$EVIDENCE_DIR/transactions_locust.log" \
    --loglevel INFO

  ended="$(date +%s.%N)"

  python3 -c "import json,sys; started=float(sys.argv[1]); ended=float(sys.argv[2]); print(json.dumps({'elapsed_seconds': ended-started}, indent=2))" "$started" "$ended" > "$EVIDENCE_DIR/transactions_duration.json"
}

phase72_run_proofs() {
  echo
  echo "============================================================"
  echo "Phase 7.2 zk Proof Generation Benchmark"
  echo "============================================================"

  phase72_seed_proof_transactions
  phase71_start_zk_prover

  rm -f "$EVIDENCE_DIR"/proofs_*

  local proof_ids
  proof_ids="$(cat "$EVIDENCE_DIR/proof_tx_ids.txt")"

  PHASE72_SCENARIO=proofs \
  PHASE72_TOTAL_PROOF_REQUESTS="$PROOF_TARGET" \
  PHASE72_PROOF_TX_IDS="$proof_ids" \
  locust \
    -f tests/performance/locustfile.py \
    --headless \
    --host "$ZK_URL" \
    -u "$PROOF_USERS" \
    -r "$PROOF_SPAWN_RATE" \
    --run-time 30s \
    --csv "$EVIDENCE_DIR/proofs" \
    --html "$EVIDENCE_DIR/proofs_report.html" \
    --logfile "$EVIDENCE_DIR/proofs_locust.log" \
    --loglevel INFO
}

phase72_generate_report() {
  echo
  echo "Generating Phase 7.2 performance report..."
  python3 tests/performance/phase72_generate_report.py
}

case "${1:-all}" in
  transactions)
    phase72_run_transactions
    phase72_generate_report
    ;;
  proofs)
    phase72_run_proofs
    phase72_generate_report
    ;;
  report)
    phase72_generate_report
    ;;
  all)
    phase72_run_transactions
    phase72_run_proofs
    phase72_generate_report
    ;;
  *)
    echo "Usage: $0 [transactions|proofs|report|all]"
    exit 2
    ;;
esac

echo
echo "Phase 7.2 evidence written to: $EVIDENCE_DIR"
