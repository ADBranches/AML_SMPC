#!/usr/bin/env bash
set -euo pipefail

pkill -f encryption-service-api || true
pkill -f he-rust-gateway || true
pkill -f zk-prover-service || true
pkill -f regulator-api-backend || true
pkill -f '/runtime/target/debug/runtime' || true

echo "[ok] local backend processes stopped"