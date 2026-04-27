#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/services/regulator-api/frontend"

cd "$FRONTEND_DIR"

if [ ! -d node_modules ]; then
  npm install
fi

echo "Starting AML SMPC frontend demo..."
echo "Open: http://127.0.0.1:5173/dashboard"

npm run dev -- --host 127.0.0.1 --port 5173
