# AML SMPC Container Diagram

## Service Containers

### encryption-service

- receives synthetic transaction submissions
- pseudonymizes sender and receiver identifiers
- calls smpc-orchestrator
- writes transaction and audit records to PostgreSQL

### smpc-orchestrator

- performs match and no-match screening
- supports privacy-preserving AML entity checks

### he-orchestrator

- supports encrypted amount processing through HE endpoints
- exposes encrypt, sum, and decrypt-test flows for validation

### zk-prover

- generates FATF_REC10 proof artifacts
- generates FATF_REC11 proof artifacts
- generates FATF_REC16 proof artifacts
- verifies proof artifacts before regulator review

### regulator-api

- retrieves proof listings
- verifies proofs
- retrieves audit timelines
- exposes evidence to a regulator or examiner workflow

### PostgreSQL

- stores transactions
- stores audit logs
- stores proof records

## Container Interaction Flow

1. Demo user submits a synthetic transaction to encryption-service.
2. encryption-service pseudonymizes identifiers and calls smpc-orchestrator.
3. smpc-orchestrator returns match or no_match screening results.
4. encryption-service writes transaction and audit records to PostgreSQL.
5. zk-prover reads transaction and audit records and generates FATF-aligned proof artifacts.
6. regulator-api retrieves proof and audit evidence for review.

## Default Local Ports

| Container | Default Port |
|---|---:|
| encryption-service | 8081 |
| he-orchestrator | 8082 |
| smpc-orchestrator | 8083 |
| zk-prover | 8084 |
| regulator-api | 8085 |

## Data Safety Note

All validation and demo flows must use synthetic records only. Real customer data must not be used in fixtures, logs, screenshots, commits, or reports.
