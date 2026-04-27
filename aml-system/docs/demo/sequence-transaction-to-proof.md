# Sequence — Transaction → Screening → Proofs → Regulator Verification

**Document purpose:** This file describes the end‑to‑end runtime sequence implemented by the AML SMPC prototype, showing how a synthetic transaction becomes (a) privately screened, (b) recorded in an auditable store, (c) converted into FATF‑aligned proof artifacts, and (d) verified by a regulator-facing API — without exposing raw sensitive payload.

> **Data safety:** All steps below assume **synthetic test records only**.

---

## Actors / Services
- **Demo User / Bank Client (synthetic)** — submits a transaction payload.
- **encryption-service** — intake + pseudonymization + triggers SMPC screening + writes DB audit.
- **smpc-orchestrator** — MP‑SPDZ driven screening; returns `match` / `no_match`.
- **he-orchestrator (he-gateway + seal-core)** — HE endpoints for encrypt/sum/decrypt-test; used for validation of encrypted arithmetic.
- **zk-prover** — generates proof artifacts for **R.10 / R.11 / R.16** and stores proof metadata.
- **regulator-api** — lists proofs, verifies selected proof, returns audit timeline.
- **PostgreSQL** — stores **transactions**, **audit_logs**, **proofs**.

Default ports:
- encryption-service: **8081**
- he-orchestrator: **8082**
- smpc-orchestrator: **8083**
- zk-prover: **8084**
- regulator-api: **8085**

---

## Sequence (numbered)

### 1) Transaction submission (synthetic)
1. **Demo user** calls:
   - `POST http://127.0.0.1:8081/transactions/submit`
2. Payload includes (synthetic):
   - `tx_id`, `sender_id`, `receiver_id`, `amount`, `currency`, `transaction_type`,
   - `originator_institution`, `beneficiary_institution`, `timestamp`,
   - optional `sender_entity_id`, `receiver_entity_id`.

### 2) Pseudonymization + DB writes
3. **encryption-service** pseudonymizes:
   - `sender_id -> sender_pseudo`
   - `receiver_id -> receiver_pseudo`
4. **encryption-service** writes:
   - `transactions` row (tx metadata + pseudonyms)
   - `audit_logs` event (submission + pseudonymization)

### 3) Private sanction screening via SMPC
5. **encryption-service** calls **smpc-orchestrator**:
   - `POST http://127.0.0.1:8083/smpc/screen` (for sender)
   - `POST http://127.0.0.1:8083/smpc/screen` (for receiver)
6. **smpc-orchestrator** runs MP‑SPDZ locally and returns:
   - `screening_result = match | no_match`
7. **encryption-service** writes additional audit events:
   - `sender_screening_completed`
   - `receiver_screening_completed`

### 4) Encrypted arithmetic (HE) — validation path
8. **he-orchestrator** supports encrypted arithmetic endpoints:
   - `POST http://127.0.0.1:8082/he/encrypt`
   - `POST http://127.0.0.1:8082/he/sum`
   - `POST http://127.0.0.1:8082/he/decrypt-test`

> Note: HE arithmetic is used to demonstrate encrypted computation capability and correctness; it can be invoked as part of demos/benchmarks.

### 5) Proof generation (FATF Recommendations)
9. **Demo user** (or automation) calls:
   - `POST http://127.0.0.1:8084/proofs/generate` with `{ "tx_id": "..." }`
10. **zk-prover** reads:
    - transaction metadata (`transactions`)
    - audit events (`audit_logs`)
11. **zk-prover** generates and stores proof artifacts for:
    - **Recommendation 10 (R.10)** — Customer Due Diligence (CDD) evidence claim
    - **Recommendation 11 (R.11)** — Record Keeping / traceability claim
    - **Recommendation 16 (R.16)** — Payment Transparency / Travel Rule metadata claim
12. Proof metadata is stored in `proofs` table and returned to caller.

### 6) Regulator retrieval + verification
13. **Regulator** lists proofs:
    - `GET http://127.0.0.1:8085/proofs?tx_id=...`
14. **Regulator** fetches proof detail:
    - `GET http://127.0.0.1:8085/proofs/{proof_id}`
15. **Regulator** verifies selected proof:
    - `POST http://127.0.0.1:8085/proofs/{proof_id}/verify`
16. **Regulator** retrieves audit timeline:
    - `GET http://127.0.0.1:8085/audit/{tx_id}`

---

## Evidence Outputs (where to look)
- Phase 7.1 functional evidence:
  - `tests/evidence/phase7_1/PHASE_7_1_FUNCTIONAL_EVIDENCE_SUMMARY.md`
- Phase 7.2 performance evidence:
  - `tests/evidence/phase7_2/PHASE_7_2_PERFORMANCE_RESULTS.md`
- Phase 7.3 compliance evidence:
  - `tests/evidence/phase7_3/PHASE_7_3_COMPLIANCE_RESULTS.md`

---

## Data Safety Note
All validation and demo flows must use **synthetic** records only. Real customer data must not appear in fixtures, logs, screenshots, commits, or report appendices.
