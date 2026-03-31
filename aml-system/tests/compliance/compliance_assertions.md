
## `tests/compliance/compliance_assertions.md`

```md
# Compliance Assertions for Phase 7

## FATF Recommendation 10

Pass if:

- a `FATF_REC10` proof exists for the transaction under test,
- the proof is retrievable,
- and the proof verification outcome is positive or recorded as generated and structurally valid.

## FATF Recommendation 11

Pass if:

- audit rows are retrievable for the transaction under test,
- a `FATF_REC11` proof exists,
- and the system shows traceability between transaction and audit events.

## FATF Recommendation 16

Pass if:

- originator and beneficiary institution metadata are present for the selected transaction,
- a `FATF_REC16` proof exists,
- and the proof can be retrieved and verified.

## Evidence required

Each compliance validation run should retain:

- proof IDs,
- transaction IDs,
- audit retrieval results,
- verification responses,
- and a final pass/fail summary.
