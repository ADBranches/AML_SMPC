# AML SMPC Application Run and Research Objectives Guide

## Purpose

This guide explains how to run the AML SMPC application from the terminal and from the frontend UI, how the system demonstrates the research thesis objectives, and whether the current frontend is enough for final defense.

The project is a privacy-preserving anti-money laundering compliance prototype for financial institutions. It demonstrates:

- Secure Multi-Party Computation (SMPC)-style collaborative screening.
- Homomorphic Encryption-oriented service architecture.
- Zero-Knowledge proof generation.
- JWT authentication and role-based access control.
- Transaction submitter/reviewer separation.
- Regulator proof verification.
- Audit evidence.
- Auditor read-only evidence access.
- Three-bank collaborative screening evidence.

---

## 1. Final Frontend Decision

### Are we leaving the frontend as it is?

For final submission and defense, the current frontend is enough because it already demonstrates the core enterprise workflow:

- public landing page;
- registration;
- login;
- super-admin approval and role governance;
- role-specific dashboards;
- institution transaction submission;
- transaction review and approval;
- screening and proof-generation workflow;
- regulator proof, audit, and compliance pages;
- auditor read-only evidence access.

The current frontend is also aligned with the report architecture because the report describes a regulator-facing interface that displays verified proofs without revealing raw transaction data, while computation is handled by the HE/SMPC/proof services.

### What is not yet fully UI-driven?

The three-bank SMPC collaboration demo is currently proven through:

```bash
./scripts/demo/run-three-bank-smpc-demo.sh
```

That script calls the backend SMPC endpoint and proves:

- Bank A, Bank B, and Bank C participate;
- raw bank private inputs are not disclosed;
- aggregate screening evidence is returned;
- the regulator remains a verifier of downstream proof/audit evidence.

So, the frontend should not be described as incomplete. The better professional statement is:

> The current frontend demonstrates the enterprise AML workflow and regulator/auditor access. The three-bank SMPC collaboration is demonstrated through a validated backend endpoint and terminal evidence script. A dedicated frontend page for three-bank SMPC is optional polish, not a blocker for final defense.

### Optional future polish

If there is extra time, add a page like:

```text
/regulator/three-bank-smpc-demo
```

or:

```text
/institution/collaborative-screening
```

This page would call the three-bank SMPC endpoint and display:

- Bank A, Bank B, Bank C;
- party contribution counts;
- aggregate risk score;
- cross-bank overlap count;
- raw input disclosure status;
- screening status;
- regulator-verification boundary.

This is recommended only if you want a richer visual demonstration. It is not required before submission because the validated backend script already proves the research objective.

---

## 2. Research Thesis Alignment

The final year project report describes the system as a furnished prototype that integrates SMPC, homomorphic encryption, and zero-knowledge proof techniques to support secure transaction processing and auditable compliance on commodity hardware.

The report also frames the system around:

- privacy-preserving transaction processing;
- FATF Recommendation 10 customer due diligence evidence;
- FATF Recommendation 11 record-keeping evidence;
- FATF Recommendation 16 payment-transparency/travel-rule evidence;
- GDPR-aligned pseudonymization and audit handling;
- a three-party banking scenario;
- a regulator-facing interface for verified proofs.

The proposal similarly frames the system as an open-source privacy-preserving AML prototype integrating MP-SPDZ for SMPC, Microsoft SEAL for HE, and arkworks/Halo2 for zk proof generation, targeting commodity CPU deployment and future multi-bank scalability.

---

## 3. Correct Explanation of Actors

Use this explanation during defense:

```text
Bank A, Bank B, and Bank C are the privacy-preserving computation participants.
The regulator is not a raw-input SMPC computation party.
The regulator verifies proof and audit evidence after computation.
The auditor has read-only evidence access.
```

This distinction is important because the project is not merely a single-bank screening tool. It demonstrates both:

1. an institution-controlled AML transaction workflow; and
2. a three-bank SMPC-style collaboration model.

---

## 4. Start Backend Services

Open Terminal 1:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system
source env/bin/activate
./scripts/demo/run-frontend-backend.sh
```

Keep this terminal open.

Expected backend services:

| Service | Port | Purpose |
|---|---:|---|
| encryption-service | 8081 | Transaction privacy and encryption workflow |
| HE orchestrator | 8082 | Homomorphic encryption gateway |
| SMPC runtime | 8083 | SMPC screening and three-bank collaboration |
| zk prover | 8084 | FATF proof generation |
| regulator API | 8085 | Auth, RBAC, transactions, proofs, audit APIs |

Check services from another terminal:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system

curl -fsS http://127.0.0.1:8081/health | jq .
curl -fsS http://127.0.0.1:8082/health | jq .
curl -fsS http://127.0.0.1:8083/health | jq .
curl -fsS http://127.0.0.1:8084/health | jq .
curl -fsS http://127.0.0.1:8085/health | jq .
```

Expected: all services return healthy JSON.

---

## 5. Start Frontend UI

Open Terminal 2:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/regulator-api/frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Open:

```text
http://127.0.0.1:5173
```

---

## 6. Frontend UI Demonstration Flow

### 6.1 Public access

Show:

```text
/
 /about
 /login
 /register
```

Explain:

```text
Unauthenticated users can only access public pages.
Protected dashboards require login and RBAC authorization.
```

### 6.2 Super admin governance

Login:

```text
super.admin@aml-smpc.local
SuperAdmin123
```

Show:

```text
/super-admin/dashboard
/super-admin/pending-users
/super-admin/users
/super-admin/organizations
/super-admin/roles
```

Demonstrate:

- pending users;
- role assignment;
- activate/deactivate users;
- organization visibility;
- RBAC governance.

### 6.3 Transaction submitter

Login:

```text
demo.submitter@example.com
StrongPass123
```

Show:

```text
/institution/transactions/new
/institution/transactions
```

Demonstrate:

- create a transaction workflow request;
- transaction enters `submitted` state;
- submitter cannot approve the transaction.

### 6.4 Transaction reviewer

Login:

```text
demo.reviewer@example.com
StrongPass123
```

Show:

```text
/institution/transactions
/institution/reviews
/institution/transactions/approved
/institution/screening-results
```

Demonstrate:

1. approve submitted transaction;
2. run screening;
3. generate proofs.

Expected final state:

```text
proof_generated
```

### 6.5 Regulator

Login:

```text
demo.regulator@example.com
StrongPass123
```

Show:

```text
/regulator/dashboard
/regulator/proofs
/regulator/audit
/regulator/compliance-report
```

Demonstrate:

- proof access;
- proof verification;
- audit timeline;
- FATF Recommendation 10, 11, and 16 evidence.

### 6.6 Auditor

Login:

```text
demo.auditor@example.com
StrongPass123
```

Show:

```text
/regulator/proofs
/regulator/audit
/regulator/compliance-report
```

Demonstrate:

- auditor can read proof and audit evidence;
- auditor cannot verify proofs.

---

## 7. Terminal Demonstration Flow

### 7.1 Three-bank SMPC collaboration demo

Run from `aml-system`:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system
./scripts/demo/run-three-bank-smpc-demo.sh
```

Expected:

```text
BANK-1 THREE-BANK SMPC COLLABORATION DEMO PASSED
```

This proves:

- exactly three bank parties are involved;
- private/pseudonymized inputs are contributed by each bank;
- raw bank inputs are not disclosed in the response;
- aggregate risk evidence is produced;
- the regulator verifies downstream proof/audit evidence instead of participating as a raw-data computation party.

### 7.2 Final objective validation

Run:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system
./scripts/demo/run-demo1-final-objective-validation.sh
```

Expected:

```text
AUTH-8 RBAC VALIDATION PASSED
DEMO-1 FINAL PROJECT OBJECTIVE VALIDATION PASSED
```

### 7.3 Final repository audit

Run from repo root:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC
./aml-system/scripts/ci/final-repository-audit.sh
```

Expected:

```text
FINAL-4 REPOSITORY AUDIT PASSED
```

### 7.4 Final rehearsal check

Run from repo root:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC
./aml-system/scripts/demo/final-presentation-rehearsal-check.sh
```

Expected:

```text
FINAL-5 PRESENTATION REHEARSAL CHECK PASSED
```

---

## 8. Demo Credentials

| Role | Email | Password |
|---|---|---|
| super_admin | super.admin@aml-smpc.local | SuperAdmin123 |
| institution_admin | demo.institution.admin@example.com | StrongPass123 |
| transaction_submitter | demo.submitter@example.com | StrongPass123 |
| transaction_reviewer | demo.reviewer@example.com | StrongPass123 |
| regulator | demo.regulator@example.com | StrongPass123 |
| auditor | demo.auditor@example.com | StrongPass123 |

---

## 9. Objective-to-System Mapping

| Research Objective | Implementation Evidence |
|---|---|
| Integrate SMPC, HE, and zk proof techniques | SMPC runtime, HE orchestrator, zk prover, proof workflows |
| Support FATF Recommendation 10 | FATF_REC10 proof evidence for CDD/KYC-aligned checks |
| Support FATF Recommendation 11 | FATF_REC11 proof and audit-linkage evidence |
| Support FATF Recommendation 16 | FATF_REC16 proof for payment-transparency/travel-rule metadata |
| Support GDPR-aligned privacy controls | pseudonymization/audit evidence and privacy-preserving workflows |
| Demonstrate privacy-preserving AML screening | transaction screening plus three-bank SMPC demo |
| Demonstrate regulator-verifiable compliance | regulator proof verification and audit pages |
| Preserve role boundaries | JWT, frontend route guards, backend RBAC permission checks |
| Support auditor read-only access | auditor reads proof/audit but cannot verify proof |
| Support commodity-hardware feasibility | local CPU-based builds and validation scripts |
| Produce a defense-ready artifact | FINAL-4 audit and FINAL-5 rehearsal checks |

---

## 10. Frontend Coverage Status

### Already wired to frontend

The frontend is wired for:

- public landing page;
- about page;
- login;
- register;
- JWT sessions;
- role-specific dashboards;
- super-admin governance;
- institution transaction submission;
- transaction review;
- screening/proof workflow visibility;
- regulator proof/audit/compliance access;
- auditor read-only access.

### Not fully represented as a dedicated UI page

The three-bank SMPC collaboration demo is currently terminal-backed through:

```bash
./scripts/demo/run-three-bank-smpc-demo.sh
```

This is acceptable for final defense because it directly validates the collaborative screening model through the backend service. However, a dedicated UI page would make the demonstration more visually complete.

### Recommendation

For immediate submission:

```text
Keep the frontend as it is.
Use terminal BANK-1 demo to prove three-bank collaboration.
Use frontend to demonstrate user workflows, RBAC, transaction review, regulator proof verification, and audit evidence.
```

For extra polish:

```text
Add a dedicated /regulator/three-bank-smpc-demo page in a later optional UI polish phase.
```

---

## 11. Optional Frontend Enhancement Specification

If implementation continues after submission readiness, add:

```text
/regulator/three-bank-smpc-demo
```

Feature behavior:

- button: `Run Three-Bank SMPC Demo`;
- display Bank A, Bank B, Bank C contribution summary;
- display aggregate risk score;
- display cross-bank overlap count;
- display `raw_bank_inputs_disclosed = false`;
- display screening status;
- display evidence statement;
- show note: “Regulator verifies proof/audit evidence and is not a raw-input SMPC party.”

Suggested file additions:

```text
services/regulator-api/frontend/src/api/smpcApi.ts
services/regulator-api/frontend/src/pages/regulator/ThreeBankSmpcDemoPage.tsx
```

Suggested route:

```text
/regulator/three-bank-smpc-demo
```

This is recommended as future polish, not as a blocker.

---

## 12. Final Presentation Rule

Do not modify core code during final rehearsal.

Use only:

```text
start backend
start frontend
run three-bank demo
run DEMO-1 validation
run FINAL-4 audit
present through frontend UI
```

Use synthetic demo records only. Do not use real customer, bank, regulator, account, or transaction data.

---

## 13. Final Verdict

The project is final-presentation ready.

The frontend does not have to be expanded before submission. It already supports the main enterprise workflow and regulator-facing verification pages. The three-bank SMPC collaboration model is proven through the validated backend endpoint and terminal script.

A dedicated frontend page for three-bank SMPC would be strong visual polish, but it is optional.
