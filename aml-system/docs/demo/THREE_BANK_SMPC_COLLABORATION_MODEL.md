# Three-Bank SMPC Collaboration Model

## Purpose

This document clarifies the collaboration model demonstrated by the AML SMPC prototype.

The project does not model AML screening as only a single-bank internal process. It demonstrates a privacy-preserving multi-institution model where three banks participate in collaborative screening without exposing raw private customer or counterparty data to one another.

## Correct Participant Roles

| Actor | Role in the Prototype |
|---|---|
| Bank A | SMPC participant and transaction-originating financial institution |
| Bank B | SMPC participant and beneficiary/counterparty financial institution |
| Bank C | Additional SMPC participant for threshold/collaborative screening |
| Regulator | Verifier of compliance proofs and audit evidence |
| Auditor | Read-only evidence reviewer |
| Super Admin | User, role, organization, and approval governance |

## Key Clarification

The regulator is not modeled as a raw-input SMPC party.

Instead:

1. Banks contribute private or pseudonymized screening inputs.
2. The SMPC layer produces aggregate screening evidence.
3. The proof layer generates compliance artifacts.
4. The regulator verifies proof and audit evidence without seeing raw bank inputs.

## What BANK-1 Demonstrates

The BANK-1 demo shows:

- exactly three bank parties;
- private customer and counterparty references per bank;
- aggregate risk scoring;
- possible cross-bank overlap detection;
- no raw bank input disclosure in the SMPC response;
- clear separation between bank-side computation and regulator-side verification.

## Research Alignment

This aligns the implementation with the project report scope: a three-party banking scenario for privacy-preserving transaction processing, sanction screening, compliance proof generation, and auditable record handling.
