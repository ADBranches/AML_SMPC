#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FIXTURE="$ROOT_DIR/tests/fixtures/sanction_list.csv"

echo "[seed] sanction list fixture:"
cat "$FIXTURE"