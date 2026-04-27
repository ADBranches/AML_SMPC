# AML SMPC Prototype

## Overview

AML SMPC is a privacy-preserving Anti-Money Laundering compliance prototype.

It integrates:

- secure multiparty computation for entity screening
- homomorphic encryption for encrypted amount processing
- zk proof generation and verification for compliance evidence
- audit logging
- regulator-facing proof retrieval

## Main Services

| Service | Purpose | Default Port |
|---|---|---:|
| encryption-service | Transaction submission and pseudonymization | 8081 |
| he-orchestrator | HE encryption/sum/decrypt-test gateway | 8082 |
| smpc-orchestrator | Match/no-match screening | 8083 |
| zk-prover | Proof generation and verification | 8084 |
| regulator-api | Regulator proof and audit retrieval | 8085 |

## Validation Evidence

Phase 7 evidence is stored in:

- tests/evidence/phase7_1/
- tests/evidence/phase7_2/
- tests/evidence/phase7_3/

## Phase 7 Validation Summary

- Phase 7.1 validates functional correctness.
- Phase 7.2 validates performance behavior.
- Phase 7.3 validates FATF-aligned compliance evidence.

## Demo Focus

The prototype demo should show:

- transaction submission
- pseudonymization
- SMPC screening
- proof generation
- regulator proof retrieval
- audit timeline retrieval

## Data Safety

All demo and validation data must be synthetic. Do not use real customer data in fixtures, evidence logs, screenshots, commits, or reports.
