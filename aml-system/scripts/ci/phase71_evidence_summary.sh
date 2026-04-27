#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="$ROOT_DIR/tests/evidence/phase7_1"
SUMMARY_FILE="$EVIDENCE_DIR/PHASE_7_1_FUNCTIONAL_EVIDENCE_SUMMARY.md"

mkdir -p "$EVIDENCE_DIR"

cat > "$SUMMARY_FILE" <<SUMMARY
# Phase 7.1 Functional Testing Evidence Summary

## Scope

Phase 7.1 validates functional correctness for:

- HE encryption/decryption flow
- SMPC match/no-match screening
- zk proof generation and verification readiness
- End-to-end API flow readiness

## Evidence Directory

\`\`\`text
$EVIDENCE_DIR
\`\`\`

## Captured Logs

SUMMARY

find "$EVIDENCE_DIR" -maxdepth 1 -type f -name "*.log" | sort | while read -r log_file; do
  name="$(basename "$log_file")"
  echo "### $name" >> "$SUMMARY_FILE"
  echo >> "$SUMMARY_FILE"
  echo "\`\`\`text" >> "$SUMMARY_FILE"
  tail -80 "$log_file" >> "$SUMMARY_FILE"
  echo "\`\`\`" >> "$SUMMARY_FILE"
  echo >> "$SUMMARY_FILE"
done

echo "Evidence summary generated:"
echo "$SUMMARY_FILE"
