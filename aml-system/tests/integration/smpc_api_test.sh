#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$SCRIPT_DIR/smpc_match_test.sh"
"$SCRIPT_DIR/smpc_no_match_test.sh"

echo "SMPC API test PASSED"
