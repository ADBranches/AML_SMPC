#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

mkdir -p tests/evidence/phase7_3

case "${1:-all}" in
  r10)
    ./tests/compliance/r10_cdd_validation.sh
    python3 tests/compliance/phase73_generate_report.py
    ;;
  r11)
    ./tests/compliance/r11_recordkeeping_validation.sh
    python3 tests/compliance/phase73_generate_report.py
    ;;
  r16)
    ./tests/compliance/r16_travelrule_validation.sh
    python3 tests/compliance/phase73_generate_report.py
    ;;
  report)
    python3 tests/compliance/phase73_generate_report.py
    ;;
  all)
    ./tests/compliance/r10_cdd_validation.sh
    ./tests/compliance/r11_recordkeeping_validation.sh
    ./tests/compliance/r16_travelrule_validation.sh
    python3 tests/compliance/phase73_generate_report.py
    ;;
  *)
    echo "Usage: $0 [r10|r11|r16|report|all]"
    exit 2
    ;;
esac

echo
echo "Phase 7.3 compliance evidence written to tests/evidence/phase7_3"
