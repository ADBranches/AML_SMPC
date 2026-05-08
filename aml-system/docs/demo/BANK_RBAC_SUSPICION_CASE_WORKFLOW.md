# Bank RBAC, Suspicion, and Anomaly Case Workflow

## Purpose

This document explains the enterprise workflow implemented in the AML SMPC system.

The current implementation demonstrates that suspicious transaction identification begins at the financial-institution layer, not at the regulator layer.

## Correct Flow

1. A partner bank user registers under an approved partner-bank code.
2. A super admin approves the user and assigns a role.
3. A transaction submitter creates a transaction.
4. A transaction reviewer evaluates AML risk.
5. Bank-side rules flag suspicious activity.
6. The reviewer approves the transaction for screening.
7. SMPC screening produces privacy-preserving aggregate evidence.
8. Proofs and audit records are generated.
9. The regulator verifies evidence.
10. The regulator opens an anomaly case.
11. Involved banks receive scoped notices.
12. Banks respond without seeing other banks' raw data.
13. Auditors can inspect evidence in read-only mode.

## Privacy Boundary

Banks may see:

- case ID
- their own related transaction reference
- risk level
- regulator finding
- required action
- aggregate SMPC evidence summary

Banks should not see:

- other banks' customer IDs
- other banks' raw account IDs
- other banks' raw transaction payloads

## Research Framing

Bank A, Bank B, and Bank C are SMPC-style participants. They contribute private or pseudonymized information. The SMPC runtime returns aggregate evidence. The regulator does not receive raw bank inputs.
