#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "============================================================"
echo "AML SMPC FINAL DEMO"
echo "============================================================"

echo
echo "Step 1: Verify Phase 7 completion evidence"
./scripts/ci/verify-phase7-completion.sh

echo
echo "Step 2: Show Phase 7.1 functional evidence summary"
sed -n '1,80p' tests/evidence/phase7_1/PHASE_7_1_FUNCTIONAL_EVIDENCE_SUMMARY.md

echo
echo "Step 3: Show Phase 7.2 performance evidence summary"
sed -n '1,120p' tests/evidence/phase7_2/PHASE_7_2_PERFORMANCE_RESULTS.md

echo
echo "Step 4: Show Phase 7.3 compliance evidence summary"
sed -n '1,160p' tests/evidence/phase7_3/PHASE_7_3_COMPLIANCE_RESULTS.md

echo
echo "============================================================"
echo "FINAL DEMO COMPLETE"
echo "============================================================"
