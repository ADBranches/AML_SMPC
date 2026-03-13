#!/usr/bin/env bash
set -euo pipefail

mkdir -p \
  services/encryption-service/api/src \
  services/encryption-service/fpe \
  services/encryption-service/schemas \
  services/he-orchestrator/seal-core/src \
  services/he-orchestrator/seal-core/include \
  services/he-orchestrator/rust-gateway/src \
  infra/postgres/migrations

touch \
  services/encryption-service/api/src/main.rs \
  services/encryption-service/api/src/routes.rs \
  services/encryption-service/api/src/pseudonymize.rs \
  services/encryption-service/fpe/mod.rs \
  services/encryption-service/schemas/transaction.schema.json \
  services/encryption-service/schemas/pseudonymized-transaction.schema.json \
  services/he-orchestrator/seal-core/CMakeLists.txt \
  services/he-orchestrator/seal-core/include/seal_bridge.hpp \
  services/he-orchestrator/seal-core/src/context.cpp \
  services/he-orchestrator/seal-core/src/encrypt.cpp \
  services/he-orchestrator/seal-core/src/sum.cpp \
  services/he-orchestrator/seal-core/src/decrypt.cpp \
  services/he-orchestrator/rust-gateway/src/main.rs \
  services/he-orchestrator/rust-gateway/src/ffi.rs \
  services/he-orchestrator/rust-gateway/src/routes.rs \
  infra/postgres/migrations/001_create_transactions.sql \
  infra/postgres/migrations/002_create_audit_logs.sql
