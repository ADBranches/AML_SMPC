#!/usr/bin/env bash
set -euo pipefail
export SOFTHSM2_CONF="${SOFTHSM2_CONF:-$PWD/infra/softhsm/conf/softhsm2.conf}"
mkdir -p infra/softhsm/tokens
softhsm2-util --init-token --free --label "aml-dev-token" --so-pin 12345678 --pin 123456
softhsm2-util --show-slots