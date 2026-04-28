#!/usr/bin/env bash
set -euo pipefail

: "${PORT:=10000}"
: "${REGULATOR_API_BIND:=127.0.0.1:18085}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required." >&2
  exit 1
fi

export REGULATOR_API_BIND
export RUST_LOG="${RUST_LOG:-info}"

sed "s/__PORT__/${PORT}/g" /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Starting regulator API on ${REGULATOR_API_BIND}..."
/usr/local/bin/regulator-api-backend &
BACKEND_PID="$!"

cleanup() {
  kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo "Starting nginx on 0.0.0.0:${PORT}..."
nginx -g "daemon off;"
