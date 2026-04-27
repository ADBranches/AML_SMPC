#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/services/regulator-api/frontend"

cd "$FRONTEND_DIR"

if [ ! -d node_modules ]; then
  npm install
fi

npm run build

echo "Frontend build complete:"
echo "$FRONTEND_DIR/dist"
