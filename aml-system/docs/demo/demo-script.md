# AML SMPC Final Demo Script

## Purpose

This script guides a 5 to 10 minute demonstration of the AML SMPC prototype.

## Demo Goal

Show how the system processes a transaction through privacy-preserving AML workflows and produces regulator-verifiable compliance evidence.

## Demo Flow

### 1. Introduce the Problem

Traditional AML systems often require sensitive customer and transaction data to be exposed across compliance checks.

This project demonstrates a privacy-preserving AML prototype that combines:

- SMPC screening
- homomorphic encryption
- zk proof generation
- audit logging
- regulator-facing proof retrieval

### 2. Show the Architecture

Key services:

- encryption-service: transaction submission and pseudonymization
- smpc-orchestrator: privacy-preserving screening
- he-orchestrator: encrypted amount processing
- zk-prover: proof generation and verification
- regulator-api: audit and proof retrieval
- PostgreSQL: transaction, audit, and proof storage

### 3. Demonstrate Transaction Submission

Show a synthetic AML transaction being submitted through the encryption service.

Expected result:

- transaction is accepted
- sender and receiver identifiers are pseudonymized
- SMPC screening is triggered
- audit rows are created

### 4. Demonstrate SMPC Screening

Show match and no-match screening behavior using synthetic entity IDs.

Expected result:

- sanctioned entity returns match
- clean entity returns no_match
- raw customer information is not exposed during screening

### 5. Demonstrate zk Proof Generation

Generate FATF-aligned proof artifacts for the submitted transaction.

Expected result:

- FATF_REC10 proof is generated
- FATF_REC11 proof is generated
- FATF_REC16 proof is generated
- proof verification status is recorded

### 6. Demonstrate Regulator Retrieval

Use the regulator API to retrieve proof and audit evidence.

Expected result:

- regulator can list proofs by transaction
- regulator can verify a proof
- regulator can view audit timeline
- proof details expose compliance signals, not raw customer data

### 7. Show Validation Evidence

Point to the Phase 7 evidence directories:

- tests/evidence/phase7_1/
- tests/evidence/phase7_2/
- tests/evidence/phase7_3/

Explain that Phase 7 validates functional correctness, performance behavior, and FATF-aligned compliance evidence.

## Closing Statement

The demo shows that AML workflows can be executed with privacy-preserving controls while still producing regulator-verifiable evidence.

## Data Safety Note

All demo records are synthetic. No real customer data should be used, printed, committed, or shown during the demonstration.
