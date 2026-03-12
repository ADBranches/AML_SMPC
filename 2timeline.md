

***

# 0) Non-Negotiable Scope Freeze (Read This First)

## You are **not** building a full AML platform

You are building **one finished MVP flow** only.

## The MVP flow

1.  A bank submits a transaction.
2.  Sender and receiver identifiers are pseudonymized.
3.  Sender and receiver are screened privately through SMPC.
4.  Transaction amount logic is executed on encrypted values through HE.
5.  Compliance assertions are turned into proof artifacts.
6.  A regulator verifies the result through the dashboard.
7.  Audit records are stored, linked, and retrievable. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

## The MVP must show support for:

*   **Rec. 10** → CDD/KYC status assertion, [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html)
*   **Rec. 11** → record-keeping / audit linkage assertion, [\[blog.pibisi.com\]](https://blog.pibisi.com/en/2025/03/fatf-recommendation-11/)
*   **Rec. 16** → required payment-transparency field inclusion assertion. [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)

***

# 1) What Is In and What Is Out

## IN SCOPE — mandatory

These are mandatory because they are directly tied to the report’s architecture, methodology, and final demo value. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

*   Rust backend services for orchestration and APIs. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)
*   Microsoft SEAL for encrypted arithmetic. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)
*   MP-SPDZ for private sanction screening. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)
*   SoftHSM for key handling. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)
*   PostgreSQL for transaction, proof, and audit metadata. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)
*   React regulator dashboard. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)
*   k3s deployment. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)
*   Prometheus + Loki observability. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)
*   PlantUML diagrams. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)
*   Locust benchmarking. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

## OUT OF SCOPE — do not touch before MVP is done

These are either explicitly future-oriented in the report or non-blocking to the MVP. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

*   liboqs / FALCON integration
*   Tamarin as a blocking task
*   SGX / Open Enclave / enclave attestation
*   physical HSMs
*   multi-bank production federation
*   advanced browser-side WASM verifier if backend verification already works
*   full bank web portal beyond a thin submission client
*   “AI AML detection” extras
*   GPU optimization
*   full enterprise IAM

If any of these start taking time before the core flow is done, **stop immediately**.

***

# 2) Final Definition of Done (This Is the Real Target)

The MVP is **done** only if all these are true:

## Product done

*   one sample transaction can be submitted from the bank service,
*   the stored sender/receiver are pseudonymized,
*   private sanction screening returns match/no-match,
*   encrypted amount computation executes successfully,
*   proof artifacts for Rec. 10 / 11 / 16 are created and stored,
*   regulator can verify the proof result through the dashboard,
*   audit trail links **transaction → screening → proof → verification event**. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true), [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html), [\[blog.pibisi.com\]](https://blog.pibisi.com/en/2025/03/fatf-recommendation-11/), [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)

## Academic done

*   architecture diagrams match the implementation,
*   validation metrics are captured,
*   methodology chapters map to actual built components,
*   limitations are separated from achieved functionality,
*   demo can be reproduced from scripts. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

## Investor done

*   30-second problem statement is clear,
*   demo visibly shows **private screening + verifiable proof**,
*   commodity-hardware deployment is demonstrated,
*   open-source extensibility is clear,
*   next-stage scale roadmap is documented. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

***

# 3) Critical Path (Do Not Break This)

This is the only valid build sequence:

1.  foundation and security baseline
2.  transaction ingestion and pseudonymization
3.  homomorphic amount logic
4.  SMPC sanction screening
5.  proof generation
6.  regulator API and audit linkage
7.  dashboard
8.  deployment and observability
9.  benchmarks, docs, and demo packaging [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

If any week tempts you to build the frontend before the backend path exists, **do not do it**.

***

# 4) The Sufficient 14-Week Timeline

***

## **WEEK 1 — Monorepo, Toolchains, Local Infra**

### Goal

Make the repo real and bootable.

### Build

*   create the full repo structure,
*   install Rust, C++, CMake, PostgreSQL, SoftHSM2, OpenSSL, Podman, k3s,
*   create `Makefile`, `.env.example`, `.gitignore`, root `README.md`,
*   bootstrap PostgreSQL locally,
*   create one Rust health-check service,
*   set up Podman local run scripts. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

### Must exist by Friday

*   `make dev-up` starts PostgreSQL + SoftHSM + one Rust API,
*   `GET /health` returns success,
*   repo builds without placeholder chaos.

### Acceptance gate

You are allowed to move on **only if**:

*   environment is reproducible on a clean machine,
*   at least one service compiles,
*   Postgres accepts connections,
*   SoftHSM is installed and visible.

### If blocked

Drop k3s setup from this week and keep it for Week 11.  
**Do not block Week 1 on k3s.**

***

## **WEEK 2 — Security Baseline and Transaction Stub**

### Goal

Create the secure entry point.

### Build

*   initialize SoftHSM token,
*   generate root CA and service certificates,
*   implement JWT + mTLS skeleton in `bank-client/api`,
*   create initial transaction schema,
*   create `/submit-transaction` stub route,
*   write first migration for transactions and audit events. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

### Must exist by Friday

*   authenticated request can reach bank API,
*   transaction stub creates a `transaction_id`,
*   transaction metadata is inserted in PostgreSQL,
*   audit row is created for submission event.

### Acceptance gate

You move on only if:

*   invalid certs are rejected,
*   valid requests get a transaction ID,
*   DB rows are written correctly.

### If blocked

If full JWT + mTLS is unstable, keep **mTLS mandatory** and JWT minimal.  
Do **not** spend extra days polishing auth UX.

***

## **WEEK 3 — Pseudonymization Layer**

### Goal

Make privacy visible in the stored data.

### Build

*   implement pseudonymization module in `encryption-service/fpe`,
*   create `pseudonymized_transaction` schema,
*   bank submission now calls pseudonymization before persistence,
*   save raw input only in controlled transient memory path, not long-term database records,
*   log pseudonymized values + transaction metadata in PostgreSQL. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

### Must exist by Friday

*   sender and receiver are stored only in pseudonymized form,
*   API returns both transaction status and pseudonymization status,
*   audit record reflects pseudonymization event.

### Acceptance gate

You move on only if:

*   database visibly shows pseudonymized sender/receiver,
*   same test input produces expected deterministic or controlled pseudonymized output,
*   raw names are not exposed in the normal audit view.

### If blocked

If format-preserving implementation becomes a time sink, use **field-length-preserving deterministic pseudonymization for the MVP** and clearly label it as the demo pseudonymization layer in docs.  
Do not stop the flow over perfect crypto elegance.

***

## **WEEK 4 — Homomorphic Encryption Amount Path**

### Goal

Make encrypted amount processing real.

### Build

*   implement SEAL core: context, encrypt, sum, decrypt test path,
*   expose Rust FFI gateway,
*   add route: `/he/encrypt-sum`,
*   use fixture transactions to prove encrypted addition works,
*   store ciphertext reference and result metadata, not plaintext amounts, in audit metadata. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

### Must exist by Friday

*   one test amount can be encrypted,
*   multiple encrypted amounts can be summed,
*   controlled decrypt test confirms correctness,
*   audit metadata links transaction ID to HE operation.

### Acceptance gate

You move on only if:

*   encrypted sum returns correct result in test harness,
*   Rust gateway calls C++ reliably,
*   transaction record points to HE operation ID.

### If blocked

If decrypt endpoint complicates the API, keep decryption in internal test harness only.  
The MVP needs **proof of encrypted arithmetic**, not a public decrypt feature.

***

## **WEEK 5 — MP-SPDZ Sanction Screening**

### Goal

Deliver the first big “wow” capability.

### Build

*   create sanction list fixtures,
*   implement `sanction_check.mpc`,
*   set up 3-party local MP-SPDZ execution,
*   build Rust wrapper to call MPC programs,
*   add `screen_sender` and `screen_receiver` endpoints,
*   log result as `match` / `no_match` tied to transaction ID. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

### Must exist by Friday

*   known sanctioned entity returns match,
*   known clean entity returns no match,
*   no raw identifier is exposed in the screening output,
*   transaction ID links to screening result.

### Acceptance gate

You move on only if:

*   screening result is deterministic on fixtures,
*   local 3-party execution works end-to-end,
*   logs never show raw sender/receiver names in the screening layer.

### If blocked

If both sender and receiver screening are too much, finish **sender screening first**, then extend to receiver after the main path works.

***

## **WEEK 6 — Full Backend Flow Without Proofs**

### Goal

Get the full backend product path alive before touching proofs.

### Build

Wire all completed pieces together:

`submit transaction → pseudonymize → HE process → SMPC screen → store outputs`

### Must exist by Friday

A single API-driven flow executes from start to finish and returns:

*   transaction ID,
*   pseudonymization status,
*   screening result,
*   encrypted amount operation result reference,
*   audit linkage ID. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

### Acceptance gate

You move on only if:

*   one end-to-end backend transaction runs successfully,
*   database has coherent linked records,
*   all service boundaries are stable.

### If blocked

Stop all new feature work.  
Week 6 is an **integration rescue week** if needed.

***

## **WEEK 7 — Proof Engine Part 1: Recommendation 11 First**

### Goal

Start with the easiest proof claim: **record integrity / audit linkage**.

### Why first

Rec. 11 is the cleanest proof entry point because it can be demonstrated as:

*   transaction exists,
*   audit trail exists,
*   linkage integrity holds,
*   proof verifies without showing raw transaction data. [\[blog.pibisi.com\]](https://blog.pibisi.com/en/2025/03/fatf-recommendation-11/), [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

### Build

*   create proof metadata table,
*   implement first circuit for audit linkage,
*   prover service returns proof blob + proof ID,
*   verifier service validates the proof,
*   tie proof to transaction and audit event references.

### Must exist by Friday

*   one Rec. 11 proof generates successfully,
*   verifier returns success,
*   DB stores proof metadata.

### Acceptance gate

You move on only if:

*   proof generation and verification work for one known fixture,
*   proof links to correct transaction and audit records.

***

## **WEEK 8 — Proof Engine Part 2: Recommendation 10 and Recommendation 16**

### Goal

Complete the compliance evidence layer.

### Build

*   **Rec. 10 proof**: assert required CDD/KYC check status exists for the transaction, [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html)
*   **Rec. 16 proof**: assert required originator/beneficiary/payment-transparency fields are present in the transaction package, [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)
*   unify proof metadata model,
*   add backend verification API.

### Must exist by Friday

*   all three proof types exist:
    *   Rec. 10,
    *   Rec. 11,
    *   Rec. 16, [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html), [\[blog.pibisi.com\]](https://blog.pibisi.com/en/2025/03/fatf-recommendation-11/), [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)
*   verifier API can validate a selected proof by ID.

### Acceptance gate

You move on only if:

*   each rule has at least one passing fixture,
*   proof verification returns structured result,
*   raw customer data is not required for verification.

### If blocked

If three separate circuit implementations slow you down, ship a **single proof service with three typed claims** for the MVP.  
What matters is demonstrable rule mapping, not academic overengineering.

***

## **WEEK 9 — Regulator Backend API**

### Goal

Turn backend crypto output into regulator-facing compliance data.

### Build

*   `GET /proofs`
*   `GET /proofs/:id`
*   `POST /proofs/:id/verify`
*   `GET /audit/:transaction_id`
*   regulator-friendly DB queries and views,
*   retention and compliance config docs. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

### Must exist by Friday

*   proofs can be listed,
*   a selected proof can be fetched,
*   verification result can be requested,
*   audit trail can be fetched for a selected transaction.

### Acceptance gate

You move on only if:

*   proof → transaction → audit linkage is queryable through API,
*   response payloads are clean enough for frontend use.

***

## **WEEK 10 — React Regulator Dashboard**

### Goal

Make the product visibly real.

### Build

*   Proof list page,
*   proof detail page,
*   verification status badge,
*   audit timeline component,
*   search/filter by rule or date,
*   transaction privacy-friendly detail view. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

### Must exist by Friday

Dashboard shows:

*   proof ID,
*   mapped FATF rule,
*   verification status,
*   timestamp,
*   audit timeline,
*   privacy-preserving summary only. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true), [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html), [\[blog.pibisi.com\]](https://blog.pibisi.com/en/2025/03/fatf-recommendation-11/), [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)

### Acceptance gate

You move on only if:

*   a regulator can open dashboard,
*   select proof,
*   trigger verify,
*   see result,
*   inspect audit linkage.

### If blocked

If advanced UI components take time, keep the dashboard minimal and table-based.  
A clean table with drill-down is enough.

***

## **WEEK 11 — Packaging, Containers, and k3s Deployment**

### Goal

Make the MVP deployable and resettable.

### Build

*   containerize all mandatory services,
*   create base manifests for k3s,
*   deploy PostgreSQL, bank API, encryption service, HE gateway, SMPC orchestrator, zk prover, regulator API/frontend,
*   create `reset-demo-state.sh` and `seed-demo-data.sh`. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

### Must exist by Friday

*   services start in containers,
*   k3s deployment works on dev/staging Linux environment,
*   seeded demo transaction can run in deployed mode.

### Acceptance gate

You move on only if:

*   services restart cleanly,
*   demo can be reset from scripts,
*   deployment is not dependent on manual heroics.

### If blocked

If k3s deployment slips, keep **Podman-based local demo packaging as backup**, but continue working to land k3s in Week 12.  
Do not let k3s complexity destroy the product path.

***

## **WEEK 12 — Monitoring, Logs, and Stability**

### Goal

Prove operational credibility.

### Build

*   Prometheus metrics,
*   Loki log aggregation,
*   health checks,
*   service latency dashboard,
*   proof throughput dashboard,
*   CPU usage dashboard,
*   basic alerts. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

### Must exist by Friday

*   metrics page works,
*   logs are searchable,
*   end-to-end transaction is visible in observability layer,
*   restart test passes.

### Acceptance gate

You move on only if:

*   one demo flow survives restart,
*   metrics and logs provide evidence during presentation.

***

## **WEEK 13 — Validation, Benchmarks, and Academic Packaging**

### Goal

Lock the defense story.

### Build

*   Locust scripts for controlled benchmarks,
*   collect latency and throughput numbers,
*   finalize PlantUML diagrams:
    *   context,
    *   container,
    *   component,
    *   sequence,
    *   DFD,
    *   ERD, [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)
*   write:
    *   methodology summary,
    *   validation results,
    *   limitations and future work,
    *   FATF/GDPR mapping,
    *   audit traceability note. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true), [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html), [\[blog.pibisi.com\]](https://blog.pibisi.com/en/2025/03/fatf-recommendation-11/), [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)

### Must exist by Friday

*   benchmark evidence saved,
*   diagrams final,
*   documentation matches what is actually built.

### Acceptance gate

You move on only if:

*   screenshots and metrics are already captured,
*   every claim in the demo has backing artifact.

***

## **WEEK 14 — Demo Hardening and Investor Presentation Pack**

### Goal

Make the product presentation-proof.

### Build

*   final `run-demo-flow.sh`,
*   final demo script,
*   demo checklist,
*   investor one-pager:
    *   problem,
    *   why current AML approaches expose too much data,
    *   why your architecture is different,
    *   why it runs on commodity hardware,
    *   what next funding enables, [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)
*   rehearse 5-minute, 10-minute, and 15-minute demos,
*   prepare failure recovery sequence.

### Must exist by Friday

*   one-command demo reset,
*   one-command demo run,
*   dashboard screenshots,
*   benchmark summary,
*   architecture diagrams,
*   investor narrative,
*   academic defense talking points.

### Acceptance gate

The project is done only if:

*   you can demo it from a fresh reset,
*   you can explain it in both academic and investor language,
*   every screen shown has real backend support.

***

# 5) Hard Fallback Rules (These Make the Plan Sufficient)

These are mandatory because real timelines fail when there is no contingency plan.

## Fallback Rule 1 — If k3s delays you

Use Podman local container demo as temporary fallback **without pausing product development**, then land k3s by Week 12.

## Fallback Rule 2 — If three separate proofs take too long

Use one unified proof service with typed claims for Rec. 10 / 11 / 16.  
The MVP needs **provable rule support**, not unnecessary fragmentation.

## Fallback Rule 3 — If browser-side verification becomes expensive

Use **backend verification exposed through the dashboard**.  
The dashboard still demonstrates regulator verification, which is what matters for the MVP. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

## Fallback Rule 4 — If sanction screening is unstable

Reduce the sanction fixture size, prove privacy-preserving screening on a smaller controlled dataset, and keep the demo flow intact.

## Fallback Rule 5 — If Week 6 integration is shaky

Freeze all new feature work and use Week 6 as a full integration stabilization sprint.

***

# 6) Weekly Discipline You Must Enforce

## Monday

*   define one weekly outcome,
*   define one acceptance gate,
*   freeze scope.

## Tuesday

*   build core functionality.

## Wednesday

*   continue implementation,
*   no architecture changes unless critical.

## Thursday

*   integration day,
*   fix broken contracts,
*   run tests.

## Friday

*   capture:
    *   screenshots,
    *   metrics,
    *   notes for report,
    *   notes for investor narrative,
    *   one short demo recording if possible.

## Saturday

*   docs, diagrams, cleanup only.

This pattern is necessary because your report is not just a build artifact — it is also a methodology and evaluation artifact. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

***

# 7) Minimal Acceptance Checklist Per Major Layer

## Foundation layer

*   repo boots,
*   auth works,
*   DB works,
*   SoftHSM works. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

## Privacy layer

*   pseudonymization visible in stored data,
*   raw identifiers absent from normal views. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

## HE layer

*   encrypted addition works,
*   metadata logged. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

## SMPC layer

*   sanction check returns match/no-match,
*   raw screening inputs not exposed. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

## Proof layer

*   three rule claims demonstrable:
    *   Rec. 10, [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html)
    *   Rec. 11, [\[blog.pibisi.com\]](https://blog.pibisi.com/en/2025/03/fatf-recommendation-11/)
    *   Rec. 16. [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)

## Regulator layer

*   proof list,
*   proof detail,
*   verify action,
*   audit timeline. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

## Ops layer

*   deploy,
*   restart,
*   monitor,
*   log. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

***

# 8) What You Must Not Waste Time On

Do **not** spend time on these before the MVP is done:

*   fancy React design systems,
*   advanced frontend animations,
*   full multi-tenant auth,
*   post-quantum productionization,
*   formal verification as a blocker,
*   hardware attestation,
*   physical HSM experiments,
*   extra dashboards,
*   extra banking workflows,
*   “fraud AI” extras.

None of those are required to satisfy the core academic contribution or the demo differentiation already established in the report. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

***

# 9) Final Product You Will Present

By the end of this exact plan, you will be able to present:

## In academia

*   a privacy-preserving AML prototype,
*   grounded in the architecture and methodology from your report, [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)
*   demonstrating support for Rec. 10, Rec. 11, and Rec. 16 through proof-backed compliance assertions, [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html), [\[blog.pibisi.com\]](https://blog.pibisi.com/en/2025/03/fatf-recommendation-11/), [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)
*   with measurable validation evidence, deployability, auditability, and diagrams. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

## To potential investors or funders

*   a credible prototype that shows:
    *   private sanction screening,
    *   encrypted transaction logic,
    *   verifiable compliance evidence,
    *   regulator-friendly visibility,
    *   Linux/commodity-hardware deployability,
    *   extensibility into a larger compliance product. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true)

***

# 10) The Bottom Line

**Yes — this revised timeline is sufficient.**  
Not because it magically makes the work easy, but because it is now constrained, sequenced, measurable, and protected by fallback rules.

This is the version to follow.

If you do **only** what is in this plan, and refuse scope creep, you will have a **real MVP** that is **presentable in academia** and **credible in investor conversations** within the scope your report already supports. [\[FINAL_YEAR...RT_REVISED \| Word\]](https://postbabyblissfoundation-my.sharepoint.com/personal/edwin_postbabyblissfoundation_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BB1E3B840-73C5-4244-9096-6664D4EDC7A6%7D&file=FINAL_YEAR_PROJECT_REPORT_REVISED.docx&action=default&mobileredirect=true), [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html), [\[blog.pibisi.com\]](https://blog.pibisi.com/en/2025/03/fatf-recommendation-11/), [\[fatf-gafi.org\]](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)

If you want the fastest possible next move, the next artifact I should generate for you is:

**the exact week-by-week execution board (Week 1 to Week 14 with daily tasks and deliverables)**

because that is the thing your team can literally follow every day.

