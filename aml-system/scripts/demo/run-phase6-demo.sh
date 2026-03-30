#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
K3S_KUBECTL="${K3S_KUBECTL:-sudo k3s kubectl}"
PROM_CONFIG="$ROOT_DIR/infra/monitoring/prometheus/prometheus.yml"
LOKI_CONFIG="$ROOT_DIR/infra/monitoring/loki/loki-config.yml"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "[error] missing required command: $1"; exit 1; }
}

wait_rollout() {
  local deploy="$1"
  echo "[wait] rollout $deploy"
  sudo k3s kubectl -n aml-system rollout status deployment/$deploy --timeout=120s
}

wait_service() {
  local svc="$1" port="$2" path="$3"
  local ip
  ip=$(sudo k3s kubectl -n aml-system get svc "$svc" -o jsonpath='{.spec.clusterIP}')
  echo "[wait] probing $svc at http://$ip:$port$path"
  for _ in $(seq 1 30); do
    if sudo k3s kubectl run curlprobe --rm -i --restart=Never --image=curlimages/curl:8.12.1 --       -fsS "http://$ip:$port$path" >/dev/null 2>&1; then
      echo "[ok] $svc reachable"
      return 0
    fi
    sleep 2
  done
  echo "[error] $svc not reachable"
  return 1
}

require_cmd cmake
require_cmd cargo
require_cmd podman
require_cmd jq
require_cmd sudo

"$ROOT_DIR/scripts/ci/build-all.sh"

# Reuse existing namespace from earlier phases if present.
sudo k3s kubectl apply -f "$ROOT_DIR/infra/k3s/base/namespace.yaml" 2>/dev/null || true
sudo k3s kubectl apply -f "$ROOT_DIR/infra/k3s/base/encryption-service.yaml"
sudo k3s kubectl apply -f "$ROOT_DIR/infra/k3s/base/he-orchestrator.yaml"
sudo k3s kubectl apply -f "$ROOT_DIR/infra/k3s/base/smpc-orchestrator.yaml"
sudo k3s kubectl apply -f "$ROOT_DIR/infra/k3s/base/zk-prover.yaml"
sudo k3s kubectl apply -f "$ROOT_DIR/infra/k3s/base/regulator-api.yaml"
sudo k3s kubectl apply -f "$ROOT_DIR/infra/k3s/base/ingress.yaml"

wait_rollout encryption-service
wait_rollout he-gateway
wait_rollout smpc-runtime
wait_rollout zk-prover
wait_rollout regulator-api

wait_service encryption-service 8081 /health
wait_service he-gateway 8082 /health
wait_service smpc-runtime 8083 /health
wait_service zk-prover 8084 /health
wait_service regulator-api 8085 /health

echo "[metrics] prometheus config present: $PROM_CONFIG"
[[ -f "$PROM_CONFIG" ]] || { echo "[error] missing prometheus config"; exit 1; }

echo "[logs] loki config present: $LOKI_CONFIG"
[[ -f "$LOKI_CONFIG" ]] || { echo "[error] missing loki config"; exit 1; }

echo "[done] Phase 6 deployment/ops scaffold validated."
echo "[ok] cluster up"
echo "[ok] services healthy"
echo "[ok] monitoring configs present"
echo "[ok] end-to-end flow survives restart can now be tested by re-applying manifests"
