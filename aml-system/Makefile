.PHONY: bootstrap dev-up dev-down dev-logs check db-check softhsm-check certs-check

# -------------------------------------------------------------------
# Local database source of truth
# -------------------------------------------------------------------
DB_USER ?= aml_dev
DB_PASSWORD ?= securepassword
DB_NAME ?= aml_dev
DB_PORT ?= 5433
DATABASE_URL ?= postgresql://$(DB_USER):$(DB_PASSWORD)@localhost:$(DB_PORT)/$(DB_NAME)

# -------------------------------------------------------------------
# Project bootstrap
# -------------------------------------------------------------------
bootstrap:
    ./scripts/dev/bootstrap-tree.sh

# -------------------------------------------------------------------
# Database checks
# -------------------------------------------------------------------
db-check:
    psql "$(DATABASE_URL)" -c '\conninfo'

# -------------------------------------------------------------------
# Local development helpers
# -------------------------------------------------------------------
softhsm-check:
    softhsm2-util --show-slots

certs-check:
    openssl x509 -in libs/security/mtls/ca/rootCA.crt -text -noout | head

check:
    cargo check --manifest-path services/bank-client/api/Cargo.toml

# -------------------------------------------------------------------
# Local Postgres container
# Host port = 5433
# Container port = 5432
# -------------------------------------------------------------------
dev-up:
    podman rm -f aml-postgres 2>/dev/null || true
    podman run --name aml-postgres \
        -e POSTGRES_PASSWORD=$(DB_PASSWORD) \
        -e POSTGRES_USER=$(DB_USER) \
        -e POSTGRES_DB=$(DB_NAME) \
        -p $(DB_PORT):5432 \
        -d docker.io/library/postgres:16

dev-down:
    podman rm -f aml-postgres

dev-logs:
    podman logs -f aml-postgres
