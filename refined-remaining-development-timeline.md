# Refined Remaining Development Timeline (Post–Phase 7)

## Purpose

This roadmap defines the **remaining implementation work** after the successful backend and validation milestones already achieved in Phase 7.

It is intentionally organized in **phases, not weeks**, and each phase is broken down at a **micro level** so the team can follow a clear, straightforward implementation path.

---

# 1) Current Baseline — What Is Already Done

The following major pieces are already implemented or materially demonstrated:

- **Transaction ingestion and pseudonymization path** exists through the encryption-service and persists transaction + audit records in PostgreSQL. citeturn7search1turn14search1turn1search2
- **Homomorphic encryption amount logic** exists through the HE gateway and the Microsoft SEAL bridge (`/he/encrypt`, `/he/sum`, `/he/decrypt-test`). citeturn7search1turn14search1turn1search2
- **SMPC sanction screening** exists through the SMPC runtime and private screening path. citeturn7search1turn14search1turn1search2
- **zk proof generation and verification** for **FATF Rec. 10, Rec. 11, and Rec. 16** exist in the current prover/verifier flow. citeturn7search1turn14search1turn1search2
- **Regulator backend API** exists for listing proofs, fetching proof details, verifying proofs, and retrieving audit timelines. citeturn7search1turn14search1turn1search2
- **Phase 7 functional, performance, and compliance validation** have been exercised and evidenced in the repo structure and generated artifacts. citeturn14search1turn7search1

## Immediate implication

The project is **not missing its backend core** anymore.

The remaining work is mainly about:

1. **frontend completion**,
2. **deployment proof and resettable packaging**,
3. **observability hardening**,
4. **documentation / diagram reconciliation**,
5. **final demo and presentation packaging**. citeturn1search2turn14search1

---

# 2) Remaining Gap Summary

## Still missing or not yet convincingly finished

### A. React regulator dashboard frontend
This was explicitly in scope in the report/timeline, but the implementation evidence so far shows the **regulator backend API**, not a completed React dashboard. citeturn1search2turn14search1

### B. Thin bank-facing submission experience
The timeline allowed a thin submission client rather than a full portal, but what has been evidenced is mainly API/script-driven operation rather than a polished submission UI. citeturn1search2turn14search1

### C. k3s deployment proof in packaged mode
The repo contains k3s manifests and deployment assets, but the strongest evidence so far is local/dev-mode execution plus scripts, not a clearly demonstrated **full packaged deployment flow**. citeturn14search1turn1search2

### D. Observability hardening
Prometheus/Loki scaffolding exists, but observability still needs stronger metrics/monitoring proof for presentation-grade deployment evidence. citeturn14search1turn7search1turn1search2

### E. Final documentation / diagrams / demo pack
The report expects architecture alignment, validation evidence, limitations, FATF/GDPR mapping, and demo reproducibility; these must now be finalized against the actual codebase state. citeturn1search2turn14search1

---

# 3) Refined Remaining Timeline (Phase Format)

This is the **recommended execution order from now onward**.

---

## Phase R0 — Environment Stabilization and Project Hygiene

### Objective
Create a **stable and reproducible baseline** before completing remaining product-facing and deployment-facing work.

### Why this phase exists
Current evidence shows environment drift such as different `DATABASE_URL` values across `.env`, `.env.example`, and earlier test defaults. Stabilizing this now prevents downstream issues in the frontend, deployment, and demo packaging phases. citeturn14search1

### Micro-level tasks

#### R0.1 Standardize environment variables
- unify `DATABASE_URL` across `.env`, `.env.example`, demo scripts, CI scripts, and local run scripts, citeturn14search1
- unify service bind URLs for:
  - encryption-service,
  - HE gateway,
  - SMPC runtime,
  - zk prover,
  - regulator API. citeturn7search1turn14search1

#### R0.2 Normalize script naming and execution paths
- ensure all demo scripts, CI scripts, and test wrappers use one consistent naming convention,
- remove ambiguity between `run-phaseX` and `run_phaseX` patterns if both exist,
- ensure `Makefile` or root README references the real active scripts. citeturn14search1

#### R0.3 Clean test/evidence discipline
- confirm executable test scripts live only under `tests/integration/`, `tests/compliance/`, and `tests/performance/`,
- confirm `tests/evidence/` stores evidence only,
- confirm `tests/logs/` stores raw logs only. citeturn14search1

#### R0.4 Define one canonical seed/demo transaction path
- keep `TX-E2E-001` (or another chosen canonical transaction) as the official demo seed reference,
- document how that transaction is created and reset. citeturn14search1turn7search1

### Intended outcome
By the end of this phase:
- every service can be started with one consistent environment,
- all scripts refer to the same DB and service URLs,
- no test depends on hidden shell state,
- one canonical demo seed path is documented.

### Acceptance criteria
- `.env` and `.env.example` are consistent,
- Phase 7 demo/test scripts run without manual environment correction,
- README documents the correct startup assumptions.

### Fallback rule
If deeper environment cleanup starts consuming too much time, freeze on:
- one working `.env`,
- one working demo shell profile,
- and document that as the official demo baseline.

---

## Phase R1 — Regulator Frontend Completion (Highest Priority)

### Objective
Build the **missing React regulator dashboard** so the MVP becomes visibly real and product-complete. This remains one of the biggest outstanding in-scope items from the report/timeline. citeturn1search2

### Why this phase is next
The backend already supports:
- proof listing,
- proof detail retrieval,
- proof verification,
- audit timeline retrieval. citeturn7search1turn14search1

That means the frontend can now be built directly against working APIs rather than against mock data.

### Micro-level tasks

#### R1.1 Frontend project scaffold
- create or finalize `services/regulator-api/frontend/`,
- choose the minimal React stack already acceptable for the repo,
- add `.env.example` or config for backend API base URL,
- create a basic router/layout shell. citeturn1search2turn14search1

#### R1.2 Proof list page
Build a page that:
- calls `GET /proofs`,
- displays:
  - proof ID,
  - transaction ID,
  - FATF rule ID,
  - verification status,
  - timestamp,
- supports basic filtering by transaction ID or rule ID. citeturn7search1turn14search1

#### R1.3 Proof detail page
Build a page that:
- calls `GET /proofs/:id`,
- displays:
  - proof ID,
  - transaction ID,
  - rule ID,
  - claim hash,
  - verification status,
  - created timestamp,
- intentionally avoids displaying raw customer identifiers. citeturn7search1turn14search1

#### R1.4 Verify action
Add a UI action/button that:
- calls `POST /proofs/:id/verify`,
- displays success/failure state clearly,
- updates the visible verification status badge. citeturn7search1turn14search1

#### R1.5 Audit timeline component
Build a transaction-linked audit view that:
- calls `GET /audit/:tx_id`,
- displays ordered audit events,
- makes transaction → screening → proof → verification linkage understandable. citeturn7search1turn14search1

#### R1.6 Minimal privacy-friendly UX
- keep the UI table-based and simple,
- do not add fancy animation or design systems,
- emphasize privacy-preserving summaries rather than raw internals. This matches the original scope freeze and MVP intent. citeturn1search2

### Intended outcome
By the end of this phase, a regulator can:
- open the dashboard,
- browse proofs,
- inspect a proof,
- trigger verification,
- inspect the related audit timeline.

### Acceptance criteria
- proof list loads from live backend,
- proof detail works,
- verify action works,
- audit timeline renders,
- all shown data is backed by real APIs.

### Fallback rule
If advanced UI complexity slows progress, ship a **minimal table-based dashboard** with drill-down pages. That is enough for the MVP. citeturn1search2

---

## Phase R2 — Thin Bank Submission Experience

### Objective
Provide a **demo-friendly transaction entry point** so the MVP is easier to present.

### Why this phase matters
The timeline did not require a full bank portal, but the MVP flow begins with a bank submitting a transaction. A thin submission surface improves demo clarity. citeturn1search2

### Micro-level tasks

#### Option A — Thin web form (recommended)
Build a small submission page with:
- sender ID,
- receiver ID,
- amount,
- currency,
- transaction type,
- originator institution,
- beneficiary institution,
- submit button.

#### Option B — Script-driven client with clear wrapper
If you do not want a UI here, create a polished:
- `run-bank-submit-demo.sh`,
- sample payload file,
- output formatter,
- and document it clearly in demo docs.

#### R2.1 Submission confirmation view/output
Whether UI or CLI, show:
- transaction ID,
- pseudonymization status,
- screening status,
- proof generation readiness. citeturn7search1turn14search1

#### R2.2 Demo fixtures
- prepare 2–3 canonical transaction scenarios,
- one clean transaction,
- one screened match transaction,
- one invalid payload example. citeturn14search1

### Intended outcome
The MVP has a clean, understandable **entry point** rather than looking like a backend-only system.

### Acceptance criteria
- one canonical transaction can be submitted in a demo-friendly way,
- the response is understandable without reading raw JSON by hand,
- the transaction flows into the already working backend path.

### Fallback rule
If time is limited, keep this script-driven but polish it well and document it as the official bank-side demo client.

---

## Phase R3 — Deployment Packaging and k3s Proof

### Objective
Turn the system into a **resettable, deployable MVP**.

### Why this phase matters
The report/timeline explicitly included k3s deployment and commodity-hardware deployment proof as part of the MVP value. citeturn1search2

### Micro-level tasks

#### R3.1 Verify container build paths
- confirm Dockerfiles / container definitions build for all mandatory services,
- verify service runtime dependencies (native HE bridge, DB connectivity, env files). citeturn14search1

#### R3.2 Finalize k3s manifests
Validate/finalize manifests for:
- PostgreSQL,
- encryption-service,
- HE gateway,
- SMPC runtime,
- zk prover,
- regulator backend,
- regulator frontend. citeturn14search1turn1search2

#### R3.3 Reset and seed scripts
Create/verify:
- `reset-demo-state.sh`,
- `seed-demo-data.sh`,
- optionally `run-demo-flow.sh`. citeturn1search2

#### R3.4 Deployed-mode verification
Run one full deployed-mode flow:
- submit transaction,
- generate proofs,
- verify through regulator interface,
- fetch audit timeline.

### Intended outcome
The system can be deployed, reset, reseeded, and demonstrated without fragile manual intervention.

### Acceptance criteria
- services start successfully in packaged mode,
- one seeded transaction flows end-to-end in deployed mode,
- demo reset works repeatedly.

### Fallback rule
If k3s remains slow to finalize, keep **Podman-based packaged local demo mode** as backup, but do not abandon the k3s path entirely. This matches the original fallback logic. citeturn1search2

---

## Phase R4 — Observability Hardening

### Objective
Strengthen monitoring/logging so the system looks operationally credible during presentation.

### Why this phase matters
Prometheus + Loki were in scope, but the current observability evidence is still closer to scaffold than final operational proof. citeturn14search1turn1search2

### Micro-level tasks

#### R4.1 Metrics exposure review
- confirm which services expose real metrics,
- separate health checks from performance metrics,
- add metrics endpoints or exporter strategy where needed. citeturn14search1turn7search1

#### R4.2 Prometheus configuration alignment
- ensure scrape targets are meaningful,
- ensure alert rules match live services,
- ensure dashboards align with actual metrics. citeturn14search1

#### R4.3 Loki/log pipeline proof
- ensure logs for one end-to-end transaction can be located,
- ensure log correlation is usable for demo narration. citeturn14search1

#### R4.4 Demo screenshots and restart proof
- capture screenshots for health / latency / throughput / logs,
- perform a restart test and confirm one demo flow still works. citeturn1search2turn14search1

### Intended outcome
A presentation can include:
- service health,
- flow traceability,
- and basic operational metrics.

### Acceptance criteria
- one end-to-end transaction is visible in logs,
- at least one meaningful dashboard is screenshot-ready,
- restart test passes without breaking the main flow.

### Fallback rule
If real metrics expansion becomes costly, prioritize:
- proof throughput visibility,
- transaction latency visibility,
- searchable log traces.

---

## Phase R5 — Documentation, Diagram, and Report Reconciliation

### Objective
Bring the report and the implementation into exact alignment.

### Why this phase matters
Your report is both an implementation artifact and a methodology/evaluation artifact. It must accurately reflect what was actually built and validated. citeturn1search2

### Micro-level tasks

#### R5.1 Architecture diagram reconciliation
Finalize/update:
- context diagram,
- container diagram,
- component diagram,
- sequence diagram,
- DFD,
- ERD. citeturn1search2turn14search1

#### R5.2 Validation mapping
- map Phase 7 functional results to the validation chapter,
- map Phase 7.2 results to benchmark narrative,
- map Phase 7.3 outputs to compliance evidence. citeturn14search1turn1search2

#### R5.3 FATF / GDPR / audit notes
Finalize:
- FATF mapping note,
- audit traceability note,
- GDPR/privacy note,
- limitations and future work separation. citeturn14search1turn1search2

#### R5.4 Repo docs cleanup
- update root README,
- add deployment instructions,
- add demo instructions,
- add evidence references. citeturn14search1

### Intended outcome
Every major claim in the report points to a real:
- code path,
- script,
- test result,
- diagram,
- or evidence artifact.

### Acceptance criteria
- diagrams match actual implementation,
- documentation uses the actual current script and service names,
- the validation chapter is backed by retained artifacts.

### Fallback rule
If documentation becomes too broad, focus only on documents that directly support:
- the defense,
- the report,
- and the final demo.

---

## Phase R6 — Final Demo Packaging and Presentation Pack

### Objective
Make the system **presentation-proof** in both academic and investor-facing language.

### Why this phase matters
The timeline explicitly expected the final product to be demonstrable, explainable, and resettable from scripts. citeturn1search2

### Micro-level tasks

#### R6.1 Final demo wrapper
Create or finalize:
- `run-demo-flow.sh`,
- `reset-demo-state.sh`,
- `seed-demo-data.sh`,
- `verify-demo-prereqs.sh`.

#### R6.2 Demo checklist
Prepare:
- pre-demo checklist,
- service start checklist,
- fallback sequence if one service fails,
- list of evidence artifacts to open during demo.

#### R6.3 Academic presentation pack
Prepare:
- architecture slide set,
- validation summary,
- compliance summary,
- limitations / future work slide,
- defense talking points. citeturn1search2

#### R6.4 Investor presentation pack
Prepare a one-pager or short deck covering:
- the AML privacy problem,
- why plaintext AML systems expose too much data,
- how your architecture is different,
- why it runs on commodity hardware,
- what the next funding stage unlocks. citeturn1search2

#### R6.5 Demo rehearsal modes
Rehearse:
- 5-minute version,
- 10-minute version,
- 15-minute version.

### Intended outcome
You can present the same MVP in:
- **academic mode** → methodology, architecture, validation, compliance evidence,
- **investor mode** → problem, demo, differentiation, scale roadmap.

### Acceptance criteria
- one-command demo reset exists,
- one-command demo run exists,
- the frontend and backend both participate in the demo,
- the presentation has a clear story backed by real artifacts.

### Fallback rule
If presentation materials start expanding too much, prioritize:
- the working demo,
- one strong architecture diagram,
- one benchmark summary,
- one compliance summary,
- one investor one-pager.

---

# 4) Recommended Execution Order From Now

Follow this exact order:

1. **Phase R0 — Environment Stabilization and Project Hygiene**
2. **Phase R1 — Regulator Frontend Completion**
3. **Phase R2 — Thin Bank Submission Experience**
4. **Phase R3 — Deployment Packaging and k3s Proof**
5. **Phase R4 — Observability Hardening**
6. **Phase R5 — Documentation, Diagram, and Report Reconciliation**
7. **Phase R6 — Final Demo Packaging and Presentation Pack**

---

# 5) Most Important Immediate Priority

If only one remaining area is prioritized first, it should be:

## **The React regulator dashboard frontend**

Why?

Because:
- it is explicitly still in scope, citeturn1search2
- the backend APIs it depends on already exist, citeturn7search1turn14search1
- and it is the biggest remaining gap between “strong backend prototype” and “visible finished MVP.” citeturn1search2turn14search1

---

# 6) What You Should Not Build Before the Remaining MVP Is Closed

Still avoid these until the remaining roadmap is done:

- fancy design systems,
- advanced UI animations,
- browser-side verification extras,
- SGX / liboqs / FALCON productionization,
- multi-bank production federation,
- physical HSM experiments,
- fraud AI extras,
- enterprise IAM extras. citeturn1search2

---

# 7) Final Bottom Line

## Current status
You already have the **core backend MVP flow** and substantial validation evidence. citeturn14search1turn7search1turn1search2

## Remaining work
The main unfinished areas are:
- **frontend**,
- **packaged deployment proof**,
- **observability hardening**,
- **documentation reconciliation**,
- **final demo packaging**. citeturn1search2turn14search1

## Recommended next move
Start with **Phase R1 — Regulator Frontend Completion** immediately after a short **R0 stabilization cleanup**.
