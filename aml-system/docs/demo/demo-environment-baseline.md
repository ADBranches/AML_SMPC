# Demo Environment Baseline

This document defines the official local/demo environment baseline for the AML system.

## Official environment values

```bash
DATABASE_URL=postgresql://aml_dev:securepassword@localhost:5434/aml_dev
SOFTHSM2_CONF=./infra/softhsm/conf/softhsm2.conf
RUST_LOG=info
PSEUDO_SALT=dev_demo_salt_change_me

ENCRYPTION_SERVICE_BASE_URL=http://127.0.0.1:8081
HE_GATEWAY_BASE_URL=http://127.0.0.1:8082
SMPC_BASE_URL=http://127.0.0.1:8083
ZK_PROVER_BASE_URL=http://127.0.0.1:8084
REGULATOR_API_BASE_URL=http://127.0.0.1:8085

DEMO_TX_ID=TX-E2E-001
PERF_PROOF_TX_ID=TX-E2E-001
COMPLIANCE_TX_ID=TX-E2E-001
```

## Active scripts to use

### Official active Phase 7 wrappers

* `scripts/demo/run_phase7_1.sh`
* `scripts/demo/run_phase7_2.sh`
* `scripts/demo/run_phase7_3.sh`
* `scripts/demo/run-phase7-validation.sh`

### Historical demo wrappers retained for earlier phases

* `scripts/demo/run-phase2-demo.sh`
* `scripts/demo/run-phase3-integrated-demo.sh`
* `scripts/demo/run-phase4-demo.sh`
* `scripts/demo/run-phase5-demo.sh`
* `scripts/demo/run-phase6-demo.sh`

> Rule: use the Phase 7 underscore wrappers for current validation work. Keep earlier hyphen scripts as historical/demo scaffolds unless they are explicitly being updated.

## Startup baseline

1. Load the environment:

```bash
source scripts/demo/demo-env.sh
```

2. Check prerequisites:

```bash
bash scripts/demo/verify-demo-prereqs.sh
```

3. Run the required phase script.

## Canonical seed transaction path

The official seed/demo transaction reference is:

```text
TX-E2E-001
```

It is currently used for:

* API end-to-end validation
* proof generation baselining
* performance proof benchmarking
* compliance validation

## Reset baseline

Until a dedicated reset script is finalized in later phases, use the integration seed path driven by:

```bash
bash tests/integration/api_end_to_end_test.sh
```

This script recreates the deterministic transaction/proof path for `TX-E2E-001` by cleaning prior DB artifacts and inserting fresh transaction/audit/proof state.