# Final Presentation Story

## Core Message

This project demonstrates a privacy-preserving AML compliance prototype where financial institutions can collaborate on AML screening without unnecessarily exposing raw customer or transaction data.

The system combines SMPC-style collaborative screening, HE-oriented architecture, zero-knowledge proof generation, PostgreSQL audit records, JWT sessions, and RBAC-controlled access.

## Correct Research Framing

The project should be explained as a multi-party AML compliance prototype.

The banks are the privacy-preserving computation participants.

The regulator is not treated as a raw-input SMPC party. The regulator verifies generated proof and audit evidence after the computation.

## Demonstrated Flow

1. Public users access landing, about, login, and registration pages.
2. New users register and remain pending approval.
3. Super admin approves users and assigns roles.
4. Users log in with JWT sessions.
5. RBAC restricts dashboards and backend APIs.
6. Transaction submitter creates a transaction workflow.
7. Transaction reviewer approves the transaction.
8. Approved transaction proceeds to SMPC screening.
9. Proof evidence is generated.
10. Regulator verifies proof and audit evidence.
11. Auditor reviews evidence in read-only mode.

## Final Claim

The system is a furnished, extensible, CPU-based research prototype that proves the feasibility of privacy-preserving AML compliance workflows.
