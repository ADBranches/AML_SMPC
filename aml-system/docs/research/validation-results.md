# AML SMPC Validation Results

## Purpose

This document summarizes the validation evidence produced during Phase 7 of the AML SMPC project.

Phase 7 validates:

- functional correctness
- performance behavior
- FATF-aligned compliance evidence

## Evidence Locations

- tests/evidence/phase7_1/
- tests/evidence/phase7_2/
- tests/evidence/phase7_3/

## Phase 7.1 Functional Validation

Phase 7.1 validates core system correctness across HE encryption/decryption, SMPC screening, zk proof generation and verification, and end-to-end API flows.

Primary evidence directory: tests/evidence/phase7_1/

## Phase 7.2 Performance Validation

Phase 7.2 validates throughput and latency behavior using generated performance fixtures and Locust-based benchmark runs.

Primary evidence directory: tests/evidence/phase7_2/

## Phase 7.3 Compliance Validation

Phase 7.3 validates FATF-aligned compliance evidence for Recommendation 10, Recommendation 11, and Recommendation 16.

Primary evidence directory: tests/evidence/phase7_3/

## Validation Summary

- Phase 7.1 confirms functional system behavior.
- Phase 7.2 confirms performance behavior under controlled benchmark conditions.
- Phase 7.3 confirms compliance evidence generation and regulator-facing proof verification.

## Data Safety Note

All validation evidence must use synthetic test records only. Real customer data must not be committed, printed, or included in reports.

