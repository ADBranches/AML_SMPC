# Phase R0 — Environment Stabilization and Project Hygiene

## Objective
Create a stable and reproducible baseline before completing remaining product-facing and deployment-facing work.

## Why this phase exists
The current repo already has a strong backend and validation base, but startup assumptions are still spread across:

- `.env`
- `.env.example`
- `Makefile`
- demo scripts
- CI scripts
- test wrappers

Phase R0 brings those assumptions into one official baseline.

---

## Official baseline decisions for R0

### Canonical database connection

```text
DATABASE_URL=postgresql://aml_dev:securepassword@localhost:5434/aml_dev
```

### Canonical service base URLs

```text
ENCRYPTION_SERVICE_BASE_URL=http://127.0.0.1:8081
HE_GATEWAY_BASE_URL=http://127.0.0.1:8082
SMPC_BASE_URL=http://127.0.0.1:8083
ZK_PROVER_BASE_URL=http://127.0.0.1:8084
REGULATOR_API_BASE_URL=http://127.0.0.1:8085
```

### Canonical demo/testing transaction references

```text
DEMO_TX_ID=TX-E2E-001
PERF_PROOF_TX_ID=TX-E2E-001
COMPLIANCE_TX_ID=TX-E2E-001
```

### Canonical environment support values

```text
PSEUDO_SALT=dev_demo_salt_change_me
RUST_LOG=info
SOFTHSM2_CONF=./infra/softhsm/conf/softhsm2.conf
```

---

## R0 Deliverables

### Documents

* `docs/research/phase-r0-stabilization-plan.md`
* `docs/demo/demo-environment-baseline.md`

### Scripts

* `scripts/dev/load-env.sh`
* `scripts/dev/check-env-consistency.sh`
* `scripts/demo/demo-env.sh`
* `scripts/demo/verify-demo-prereqs.sh`

### Tests

* `tests/environment/env_consistency_test.sh`
* `tests/environment/script_naming_test.sh`
* `tests/environment/evidence_layout_test.sh`
* `tests/environment/demo_seed_reference_test.sh`
* `tests/environment/README.md`

---

## Micro Timeline

### R0.A — Freeze the environment

* align `.env` and `.env.example`
* align `Makefile` DB defaults with env defaults
* define canonical service URLs
* define canonical demo transaction IDs

### R0.B — Normalize script usage

* document the active scripts to use
* reduce ambiguity between historical wrappers and active wrappers
* ensure demo helpers can load one common environment profile

### R0.C — Enforce folder hygiene

* evidence directories store artifacts only
* logs directories store logs only
* execution scripts live only in execution folders

### R0.D — Document the official demo baseline

* define startup assumptions
* define reset/seed assumptions
* define official transaction seed references

### R0.E — Validate the baseline

* run environment consistency test
* run script naming test
* run evidence layout test
* run seed reference test

---

## Completion Criteria

Phase R0 is complete only if:

* `.env` and `.env.example` match on official baseline values
* environment helper scripts load the same values every time
* demo prerequisite checks pass
* the environment validation tests pass
* official startup assumptions are documented in the repo