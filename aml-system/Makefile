.PHONY: bootstrap dev-up dev-down dev-logs check db-check softhsm-check certs-check port-check

# -------------------------------------------------------------------
# Local database source of truth
# -------------------------------------------------------------------
DB_USER ?= aml_dev
DB_PASSWORD ?= securepassword
DB_NAME ?= aml_dev
DB_PORT ?= 5434
DB_CONTAINER ?= aml-postgres
DB_VOLUME ?= aml-postgres-data
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
	@command -v psql >/dev/null 2>&1 || { echo "[error] psql is not installed or not in PATH"; exit 1; }
	@psql "$(DATABASE_URL)" -c '\conninfo'

port-check:
	@command -v ss >/dev/null 2>&1 || { echo "[error] ss is not installed or not in PATH"; exit 1; }
	@if ss -ltn | awk '{print $$4}' | grep -Eq '(^|:)$(DB_PORT)$$'; then \
		echo "[warn] port $(DB_PORT) is already in use"; \
		ss -ltnp | grep ':$(DB_PORT)'; \
	else \
		echo "[ok] port $(DB_PORT) is free"; \
	fi

# -------------------------------------------------------------------
# Local development helpers
# -------------------------------------------------------------------
softhsm-check:
	@command -v softhsm2-util >/dev/null 2>&1 || { echo "[error] softhsm2-util is not installed or not in PATH"; exit 1; }
	@if [ -z "$$SOFTHSM2_CONF" ]; then \
		echo "[error] SOFTHSM2_CONF is not set"; \
		exit 1; \
	fi
	@if [ ! -f "$$SOFTHSM2_CONF" ]; then \
		echo "[error] SoftHSM config file not found: $$SOFTHSM2_CONF"; \
		exit 1; \
	fi
	@echo "[info] using SoftHSM config: $$SOFTHSM2_CONF"
	@softhsm2-util --show-slots

certs-check:
	@test -f libs/security/mtls/ca/rootCA.crt || { echo "[error] certificate not found: libs/security/mtls/ca/rootCA.crt"; exit 1; }
	@openssl x509 -in libs/security/mtls/ca/rootCA.crt -text -noout | head

check:
	@cargo check --manifest-path services/bank-client/api/Cargo.toml

# -------------------------------------------------------------------
# Local Postgres container
# Host port = 5434
# Container port = 5432
# Persistent volume = aml-postgres-data
# -------------------------------------------------------------------
dev-up:
	@command -v podman >/dev/null 2>&1 || { echo "[error] podman is not installed or not in PATH"; exit 1; }
	@if ss -ltn | awk '{print $$4}' | grep -Eq '(^|:)$(DB_PORT)$$'; then \
		echo "[error] host port $(DB_PORT) is already in use"; \
		echo "[hint] stop the conflicting service or choose another DB_PORT"; \
		ss -ltnp | grep ':$(DB_PORT)' || true; \
		exit 1; \
	fi
	@podman volume exists $(DB_VOLUME) || podman volume create $(DB_VOLUME)
	@if podman container exists $(DB_CONTAINER); then \
		echo "[info] container $(DB_CONTAINER) already exists"; \
		if ! podman ps --format '{{.Names}}' | grep -qx '$(DB_CONTAINER)'; then \
			echo "[info] starting existing container $(DB_CONTAINER)"; \
			podman start $(DB_CONTAINER); \
		else \
			echo "[info] container $(DB_CONTAINER) is already running"; \
		fi; \
	else \
		echo "[info] creating container $(DB_CONTAINER)"; \
		podman run --name $(DB_CONTAINER) \
			-e POSTGRES_PASSWORD=$(DB_PASSWORD) \
			-e POSTGRES_USER=$(DB_USER) \
			-e POSTGRES_DB=$(DB_NAME) \
			-v $(DB_VOLUME):/var/lib/postgresql/data \
			-p $(DB_PORT):5432 \
			-d docker.io/library/postgres:16; \
	fi
	@echo "[info] waiting for PostgreSQL to become ready..."
	@until podman exec $(DB_CONTAINER) pg_isready -U $(DB_USER) -d $(DB_NAME) >/dev/null 2>&1; do \
		sleep 1; \
	done
	@echo "[ok] PostgreSQL is ready on localhost:$(DB_PORT)"

dev-down:
	@if podman container exists $(DB_CONTAINER); then \
		podman stop $(DB_CONTAINER) >/dev/null 2>&1 || true; \
		podman rm -f $(DB_CONTAINER) >/dev/null 2>&1 || true; \
		echo "[ok] removed container $(DB_CONTAINER)"; \
	else \
		echo "[info] container $(DB_CONTAINER) does not exist"; \
	fi

dev-logs:
	@podman logs -f $(DB_CONTAINER)