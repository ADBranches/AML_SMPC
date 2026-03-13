#!/usr/bin/env bash
set -euo pipefail
export SOFTHSM2_CONF="${SOFTHSM2_CONF:-$PWD/infra/softhsm/conf/softhsm2.conf}"
softhsm2-util --show-slots
