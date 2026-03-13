.PHONY: bootstrap dev-up check db-check softhsm-check certs-check

bootstrap:
    ./scripts/dev/bootstrap-tree.sh

db-check:
    psql $$DATABASE_URL -c '\conninfo'

softhsm-check:
    softhsm2-util --show-slots

certs-check:
    openssl x509 -in libs/security/mtls/ca/rootCA.crt -text -noout | head

check:
    cargo check --manifest-path services/bank-client/api/Cargo.toml

dev-up:
    podman run --name aml-postgres -e POSTGRES_PASSWORD=aml_dev_pass -e POSTGRES_USER=aml_dev -e POSTGRES_DB=aml_dev -p 5432:5432 -d docker.io/library/postgres:16