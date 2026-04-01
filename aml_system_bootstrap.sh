#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -d "$PWD/services" && -d "$PWD/tests" && -f "$PWD/Makefile" ]]; then
  ROOT_DIR="$PWD"
fi

log() {
  printf '[bootstrap] %s\n' "$*"
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1
}

install_apt_packages() {
  if ! need_cmd apt-get; then
    log "apt-get not found. Skipping OS package install."
    return 0
  fi

  log "Installing required Debian/Kali packages..."
  sudo apt-get update
  sudo apt-get install -y \
    bash git curl jq psmisc cmake build-essential pkg-config \
    python3 python3-venv python3-pip \
    postgresql-client podman iproute2 softhsm2 openssl \
    ca-certificates unzip tar rsync
}

install_rust() {
  if need_cmd cargo && need_cmd rustc; then
    log "Rust toolchain already present."
    return 0
  fi

  log "Installing rustup / cargo / rustc..."
  curl https://sh.rustup.rs -sSf | sh -s -- -y
  export PATH="$HOME/.cargo/bin:$PATH"
}

setup_python_env() {
  cd "$ROOT_DIR"

  local VENV_DIR="env"
  if [[ ! -d "$VENV_DIR" ]]; then
    log "Creating Python virtual environment at $ROOT_DIR/$VENV_DIR"
    python3 -m venv "$VENV_DIR"
  fi

  # shellcheck disable=SC1091
  source "$VENV_DIR/bin/activate"
  python -m pip install --upgrade pip
  python -m pip install locust
  log "Python environment ready: $ROOT_DIR/$VENV_DIR"
}

restore_seal() {
  cd "$ROOT_DIR"
  mkdir -p external
  if [[ ! -f external/SEAL/CMakeLists.txt ]]; then
    log "Restoring external/SEAL ..."
    rm -rf external/SEAL
    git clone --depth 1 https://github.com/microsoft/SEAL.git external/SEAL
  else
    log "external/SEAL already present."
  fi
}

check_mp_spdz() {
  cd "$ROOT_DIR"
  if [[ -d external/MP-SPDZ ]]; then
    if find external/MP-SPDZ -mindepth 1 -maxdepth 1 | read -r _; then
      log "external/MP-SPDZ appears present."
    else
      log "WARNING: external/MP-SPDZ exists but looks empty. Restore it from your intended project source before SMPC flows."
    fi
  else
    log "WARNING: external/MP-SPDZ is missing. Restore it from your intended project source before SMPC flows."
  fi
}

apply_migrations() {
  cd "$ROOT_DIR"
  if [[ -f .env ]]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
  fi

  : "${DATABASE_URL:=postgresql://aml_dev:securepassword@localhost:5434/aml_dev}"

  if ! need_cmd psql; then
    log "psql not available; cannot apply migrations."
    return 1
  fi

  log "Applying PostgreSQL migrations to $DATABASE_URL"
  psql "$DATABASE_URL" -f infra/postgres/migrations/001_create_transactions.sql
  psql "$DATABASE_URL" -f infra/postgres/migrations/002_create_audit_logs.sql
  psql "$DATABASE_URL" -f infra/postgres/migrations/003_create_proofs.sql
  psql "$DATABASE_URL" -f infra/postgres/migrations/004_create_regulator_views.sql
  psql "$DATABASE_URL" -f infra/postgres/migrations/005_retention_policy.sql
}

standardize_ports() {
  cd "$ROOT_DIR"
  log "Standardizing old 5433 defaults to 5434 where found..."
  grep -RIl '5433' scripts tests .env.example 2>/dev/null | xargs -r sed -i 's/5433/5434/g'
}

main() {
  log "Project root: $ROOT_DIR"
  install_apt_packages
  install_rust
  setup_python_env
  restore_seal
  check_mp_spdz
  standardize_ports
  apply_migrations
  log "Bootstrap completed. Next recommended step: bash scripts/demo/run_phase7_1.sh"
}

main "$@"
