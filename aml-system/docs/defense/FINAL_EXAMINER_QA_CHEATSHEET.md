# Final Examiner Q&A Cheat Sheet

## What is the main contribution?

The project demonstrates a privacy-preserving AML compliance prototype combining SMPC-style collaborative screening, HE-oriented architecture, zk proof generation, audit traceability, and RBAC-based governance.

## Is this single-bank or multi-bank?

It is presented as a multi-bank AML prototype.

The normal transaction workflow demonstrates institution-side controls, while BANK-1 demonstrates the three-bank SMPC collaboration model.

## Who participates in SMPC?

Bank A, Bank B, and Bank C participate in SMPC-style screening.

## Is the regulator an SMPC input party?

No. The regulator verifies downstream proof and audit evidence. The regulator does not receive raw private bank inputs.

## What does the regulator verify?

The regulator verifies proof metadata, proof status, audit timelines, and FATF R.10, R.11, and R.16 evidence.

## What does the auditor do?

The auditor has read-only access to proofs and audit evidence but cannot verify proofs.

## What proves the system works?

BANK-1, AUTH-8, DEMO-1, and FINAL-4 all pass. The system verifies proof count, audit count, regulator verification, and auditor access boundaries.

## What are the limitations?

This is a final-year research prototype, not a production banking deployment. Production work would need formal cryptographic review, bank integrations, hardened key management, monitoring, and regulatory approval.
