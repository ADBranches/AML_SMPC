# AML SMPC Frontend API Contract

## Purpose

This document confirms the backend API contract required before building the frontend.

## Base URL

VITE_REGULATOR_API_BASE_URL=http://127.0.0.1:8085

## Required Endpoints

### List Proofs

Method: GET
Path: /proofs?tx_id={tx_id}

Safe fields for frontend display:

- id
- tx_id
- rule_id
- public_signal
- verification_status
- created_at

### Proof Detail

Method: GET
Path: /proofs/{proof_id}

Safe fields for frontend display:

- id
- tx_id
- rule_id
- claim_hash
- public_signal
- verification_status
- proof_blob
- created_at

### Verify Proof

Method: POST
Path: /proofs/{proof_id}/verify

Expected fields:

- proof_id
- tx_id
- rule_id
- verified
- reason

### Audit Timeline

Method: GET
Path: /audit/{tx_id}

Expected fields:

- event_type
- event_status
- event_ref
- details
- created_at

## Optional Evidence Endpoints for FE3

- GET /evidence/phase7/functional
- GET /evidence/phase7/performance
- GET /evidence/phase7/compliance

## Data Safety Rule

The frontend must not display raw customer identifiers or real customer data.

Frontend display should prioritize proof status, rule ID, verification outcome, audit event type, and compliance-safe proof signals.
