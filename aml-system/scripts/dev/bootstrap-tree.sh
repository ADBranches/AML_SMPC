#!/usr/bin/env bash
set -euo pipefail

mkdir -p \
  services/bank-client/api/src \
  services/bank-client/web \
  services/bank-client/attestation \
  services/encryption-service/api/src \
  services/encryption-service/fpe \
  services/encryption-service/schemas \
  services/he-orchestrator/seal-core/src \
  services/he-orchestrator/seal-core/include \
  services/he-orchestrator/rust-gateway/src \
  services/he-orchestrator/healthchecks \
  services/smpc-orchestrator/programs \
  services/smpc-orchestrator/runtime/src \
  services/smpc-orchestrator/formal-verification/tamarin \
  services/zk-prover/circuits/fatf-rec10/src \
  services/zk-prover/circuits/fatf-rec11/src \
  services/zk-prover/circuits/fatf-rec16/src \
  services/zk-prover/prover/src \
  services/zk-prover/verifier/src \
  services/zk-prover/plugins/wasm/src \
  services/regulator-api/backend/src \
  services/regulator-api/frontend/src \
  infra/k3s/base \
  infra/k3s/overlays \
  infra/k3s/secrets \
  infra/softhsm/conf \
  infra/softhsm/scripts \
  infra/softhsm/tokens \
  infra/postgres/migrations \
  infra/postgres/seed \
  infra/monitoring/prometheus \
  infra/monitoring/loki \
  infra/monitoring/dashboards \
  libs/security/jwt/src \
  libs/security/mtls/ca \
  libs/security/mtls/certs \
  libs/security/mtls/scripts \
  libs/security/constant-time/src \
  libs/shared-models \
  tests/integration \
  tests/performance \
  tests/compliance \
  tests/fixtures \
  scripts/dev \
  scripts/ci \
  scripts/demo \
  docs/architecture \
  docs/tutorials \
  docs/research \
  docs/compliance \
  docs/investor \
  docs/demo

touch \
  README.md Makefile .env.example .gitignore \
  infra/softhsm/conf/softhsm2.conf \
  infra/softhsm/scripts/init-token.sh \
  infra/softhsm/scripts/generate-keys.sh \
  infra/softhsm/scripts/list-objects.sh \
  infra/k3s/base/namespace.yaml \
  infra/k3s/base/postgres.yaml \
  infra/k3s/base/bank-client.yaml \
  infra/postgres/migrations/001_create_transactions.sql \
  infra/postgres/migrations/002_create_audit_logs.sql
