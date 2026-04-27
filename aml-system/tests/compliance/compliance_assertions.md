# Phase 7.3 Compliance Assertions

## Naming Standard

Use the professional FATF wording:

- Recommendation 10 (R.10) — Customer Due Diligence
- Recommendation 11 (R.11) — Record Keeping
- Recommendation 16 (R.16) — Payment Transparency / Travel Rule

Do not refer to these as “rules” in final reporting.

---

## R.10 — Customer Due Diligence

### Pass Criteria

R.10 passes when:

1. A transaction exists.
2. Sender and receiver screening audit events exist.
3. A FATF_REC10 proof artifact exists.
4. The FATF_REC10 proof verifies successfully.
5. The proof claim does not expose raw sensitive customer payload.

### Required Evidence

- transaction submission response
- regulator proof listing
- R.10 proof detail
- R.10 verification response
- audit timeline showing screening events

---

## R.11 — Record Keeping

### Pass Criteria

R.11 passes when:

1. A transaction row exists.
2. Audit rows exist and are timestamped.
3. Proof rows exist and link to the transaction.
4. Regulator API can retrieve proof rows.
5. Regulator API can retrieve audit timeline.
6. The timeline is sufficient to reconstruct the compliance workflow.

### Required Evidence

- DB count summary
- regulator proof listing
- regulator audit timeline
- R.11 proof verification response

---

## R.16 — Payment Transparency / Travel Rule

### Pass Criteria

R.16 passes when:

1. Originator institution metadata is present.
2. Beneficiary institution metadata is present.
3. FATF_REC16 proof artifact exists.
4. FATF_REC16 proof verifies successfully.
5. The proof claim confirms metadata presence without exposing raw payment-party payload.

### Required Evidence

- transaction metadata check
- R.16 proof detail
- R.16 verification response
- regulator proof listing

---

## Data Safety Rule

Compliance evidence must use synthetic test records only and must not expose real customer data.
