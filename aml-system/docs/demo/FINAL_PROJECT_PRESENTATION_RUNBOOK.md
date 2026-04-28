# AML SMPC Final Project Presentation Runbook

## Purpose

This runbook guides the final presentation of the AML SMPC system.

The project demonstrates privacy-preserving AML compliance using:

- three-bank SMPC-style collaboration
- institution transaction workflows
- reviewer approval
- SMPC screening
- compliance proof generation
- regulator verification
- auditor read-only review
- JWT/RBAC-controlled access

## Correct Project Framing

This is not only a single-bank internal screening system.

The correct framing is:

Bank A, Bank B, and Bank C participate in privacy-preserving SMPC screening.
The regulator verifies downstream proof and audit evidence.
The auditor has read-only evidence access.

## Demo Order

1. Open the frontend landing page.
2. Explain public access: home, about, login, and registration.
3. Show registration and pending approval.
4. Log in as super admin and approve users.
5. Log in as transaction submitter.
6. Submit a synthetic AML transaction.
7. Log in as transaction reviewer.
8. Approve the transaction.
9. Run SMPC screening.
10. Generate FATF-aligned proof evidence.
11. Log in as regulator.
12. Review proofs, verify proof evidence, and inspect audit timeline.
13. Log in as auditor.
14. Show read-only proof and audit access.
15. Run the three-bank SMPC demo.

## Required Demo Commands

From aml-system:

./scripts/dev/seed_auth8_demo_users.sh
./scripts/ci/validate-auth8-rbac-demo.sh
./scripts/demo/run-three-bank-smpc-demo.sh
./scripts/ci/frontend-mvp-sequential-demo.sh

## Evidence to Show

- tests/evidence/auth8/AUTH_8_RBAC_VALIDATION_RESULTS.md
- tests/evidence/three_bank_smpc/THREE_BANK_SMPC_EVIDENCE_SUMMARY.md
- tests/evidence/frontend_mvp/FRONTEND_MVP_SEQUENTIAL_DEMO_RESULTS.md

## Defense Message

The prototype proves that AML workflows can be made more privacy-preserving while remaining auditable, role-governed, and regulator-verifiable.

## Data Safety Rule

Use synthetic records only. Do not use real customer, bank, or regulator data in the demo, screenshots, reports, logs, or commits.
