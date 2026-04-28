# Examiner Defense Notes

## 1. Is this a single-bank system or a multi-bank system?

It is presented as a multi-bank privacy-preserving AML prototype.

The internal transaction workflow shows how a financial institution controls submission, review, screening, and proof generation. BANK-1 extends this by explicitly demonstrating a three-bank SMPC collaboration model.

## 2. Who participates in SMPC?

The banks participate in the SMPC-style screening model.

In the demo, Bank A, Bank B, and Bank C contribute private or pseudonymized references and encrypted risk-score inputs.

## 3. Is the regulator part of the SMPC computation?

No. The regulator is not modeled as a raw-input SMPC party.

The regulator verifies downstream proof and audit evidence.

## 4. What does the regulator see?

- proof metadata
- verification status
- audit timeline
- compliance evidence for FATF R.10, R.11, and R.16

The regulator does not need raw bank private inputs in the demonstrated model.

## 5. What did the project prove?

It proved that AML compliance can support role-governed transaction workflows, privacy-preserving collaborative screening, regulator-verifiable proof evidence, and auditable records without exposing unnecessary raw private data.
