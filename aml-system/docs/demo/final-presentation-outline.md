# Final Presentation Outline — Privacy‑Preserving AML (SMPC + HE + ZK Proofs)

**Goal:** A defense‑ready and investor‑credible presentation that demonstrates (1) problem relevance, (2) technical novelty, (3) implementability on commodity hardware, and (4) measured results.

---

## Slide 1 — Title
- Developing a Hybrid SMPC‑HE Framework with ZK Proofs for Privacy‑Preserving AML Compliance
- Authors, programme, supervisor, institution

## Slide 2 — Problem
- AML compliance requires transparency but exposes sensitive customer data
- Centralized AML creates breach/insider risk and high infrastructure costs

## Slide 3 — Research Gap
- Existing solutions often require plaintext sharing or proprietary infrastructure
- Need: privacy‑preserving compliance evidence on commodity hardware

## Slide 4 — Objectives
- Integrate SMPC (MP‑SPDZ), HE (Microsoft SEAL), and ZK proofs (Halo2/arkworks)
- Produce verifiable compliance evidence
- Ensure auditability and privacy controls
- Meet performance targets (throughput and proof latency)

## Slide 5 — System Architecture (Microservices)
- encryption-service (intake + pseudonymization)
- smpc-orchestrator (private screening)
- he-orchestrator (encrypted arithmetic validation)
- zk-prover (proof generation)
- regulator-api (proof retrieval + verification)
- PostgreSQL (transactions, audit logs, proofs)

## Slide 6 — End‑to‑End Flow (Sequence)
- Transaction submit → pseudonymize → SMPC screen → audit → proof generate → regulator verify
- Emphasize: no raw payload disclosure in regulator flow

## Slide 7 — Cryptographic Components
- SMPC: private match/no‑match screening
- HE: encrypted arithmetic (encrypt/sum/decrypt-test)
- ZK: proof artifacts aligned to FATF Recommendations R.10/R.11/R.16

## Slide 8 — Testing & Validation (Phase 7)
- Functional tests: HE, SMPC, proof gen/verify, end‑to‑end API
- Compliance validation: R.10, R.11, R.16
- Evidence stored under `tests/evidence/`

## Slide 9 — Performance Results
- Transaction throughput: show requests/sec and implied 1000‑tx time
- Proof generation latency: median, P95, P99 (target < 100ms at P95)
- Error rate = 0%

## Slide 10 — Compliance Evidence
- R.10: CDD evidence claim produced
- R.11: record reconstruction from audit timeline
- R.16: payment transparency metadata claim verified

## Slide 11 — Operational Credibility
- Deployment scaffolding: k3s + Podman
- Monitoring configs: Prometheus + Loki
- Demo stability: one-command demo script, repeatable evidence

## Slide 12 — Limitations & Future Work
- Production hardening (full zk proof system, strong `/metrics`, multi-node MPC)
- Automated retention purge (if required by policy)
- Scale-out roadmap (multi-bank, HA, hardened secrets)

## Slide 13 — Demo Plan (5–10 minutes)
1. Run final demo script
2. Show Phase 7 evidence summaries
3. Show proof listing + verification + audit timeline
4. Highlight measured performance and privacy safeguards

## Slide 14 — Conclusion
- Prototype demonstrates privacy‑preserving AML compliance evidence
- Open-source + commodity hardware = realistic adoption path
- Strong foundation for funding/scale-out

---

## Appendix — What to screenshot (for defense)
- Regulator proof listing
- Proof verification response
- Audit timeline response
- Phase 7.2 performance summary page
- Container interaction diagram
