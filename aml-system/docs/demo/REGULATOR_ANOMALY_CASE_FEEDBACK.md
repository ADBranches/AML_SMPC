# Regulator Anomaly Case Feedback

## Purpose

The regulator anomaly case workflow converts suspicious SMPC/risk evidence into formal case feedback for involved banks.

## Correct Flow

1. Bank flags suspicious activity.
2. SMPC produces privacy-preserving aggregate evidence.
3. Proof and audit records are generated.
4. Regulator verifies evidence.
5. Regulator opens an anomaly case.
6. Banks receive scoped notices.
7. Banks respond to the regulator notice.

## Regulator Can

- list anomaly cases
- open anomaly case
- inspect case details
- close case
- view banks notified
- view bank response status

## Bank Can

- view own notices
- view aggregate evidence summary
- respond to regulator notice

## Auditor Can

- read regulator anomaly cases
- inspect evidence in read-only mode

## Privacy Boundary

The bank-facing notice does not expose other banks' raw customer IDs, raw account IDs, or raw transaction payloads.
