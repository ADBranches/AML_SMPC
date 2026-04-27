#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

mkdir -p dist

PACKAGE_NAME="aml-smpc-final-demo-$(date -u +%Y%m%dT%H%M%SZ).tar.gz"

echo "Creating final demo package: dist/$PACKAGE_NAME"

tar \
  --exclude='target' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='tests/evidence/**/*.log' \
  --exclude='tests/evidence/**/*.json' \
  --exclude='tests/evidence/**/*.csv' \
  --exclude='tests/evidence/**/*.html' \
  -czf "dist/$PACKAGE_NAME" \
  README.md \
  docs \
  scripts \
  tests/evidence/phase7_1/PHASE_7_1_FUNCTIONAL_EVIDENCE_SUMMARY.md \
  tests/evidence/phase7_2/PHASE_7_2_PERFORMANCE_RESULTS.md \
  tests/evidence/phase7_3/PHASE_7_3_COMPLIANCE_RESULTS.md \
  tests/performance \
  tests/compliance \
  tests/integration \
  tests/fixtures \
  infra \
  services

echo "Package written to: dist/$PACKAGE_NAME"
