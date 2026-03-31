# Phase 7 — Testing, Benchmarking & Validation Plan

## Phase Objective

Phase 7 is the **evidence phase** of the project.

It confirms that the system is:

- technically correct,
- operationally measurable,
- compliance-aligned,
- and strong enough to support the **project report**, **final demo**, and **technical evaluation**.

This phase does **not** introduce new product features.
It verifies and validates what was built in **Phases 1–6**.

---

# 7.0 Test Execution Order

To keep results organized and reproducible, Phase 7 should run in this order:

1. **Functional tests**
2. **Integration and end-to-end tests**
3. **Compliance validation tests**
4. **Performance tests**
5. **Evidence collation for report/demo**

This order ensures:

- core correctness is confirmed first,
- full service interaction is confirmed second,
- compliance assertions are validated on a working system,
- performance is measured only after correctness is stable.

---

# 7.1 Functional Tests

## Functional Scope

The functional test scope remains:

- **HE encryption/decryption**
- **SMPC equality checks**
- **zk-SNARK proof generation & verification**
- **API flows end-to-end**

For Phase 7, each test file must define:

- the exact feature under test,
- the input fixture used,
- the expected output,
- the **pass/fail rule**,
- and the evidence artifact to retain.

In addition, functional testing should include both:

- **positive-path tests** → valid input, expected success
- **negative-path tests** → invalid input, malformed data, or missing required fields

---

## 7.1.1 HE Encryption / Decryption

### Feature Under Test

The homomorphic encryption flow must correctly:

- encrypt transaction amounts,
- sum encrypted values,
- decrypt in controlled test mode,
- preserve arithmetic correctness within acceptable tolerance,
- reject malformed ciphertext or invalid payloads.

### Existing Files Under Test

```text
services/he-orchestrator/seal-core/CMakeLists.txt
services/he-orchestrator/seal-core/include/seal_bridge.hpp
services/he-orchestrator/seal-core/src/context.cpp
services/he-orchestrator/seal-core/src/encrypt.cpp
services/he-orchestrator/seal-core/src/sum.cpp
services/he-orchestrator/seal-core/src/decrypt.cpp

services/he-orchestrator/rust-gateway/Cargo.toml
services/he-orchestrator/rust-gateway/build.rs
services/he-orchestrator/rust-gateway/src/main.rs
services/he-orchestrator/rust-gateway/src/ffi.rs
services/he-orchestrator/rust-gateway/src/routes.rs
```

### New Test Files to Create

```text
tests/integration/he_encrypt_decrypt_test.sh
tests/integration/he_gateway_api_test.sh
tests/integration/he_invalid_input_test.sh
tests/fixtures/he_test_vectors.json
tests/fixtures/he_expected_outputs.json
```

### Responsibility of Each New File

#### `tests/integration/he_encrypt_decrypt_test.sh`

Will test:

- encrypt one amount,
- encrypt second amount,
- sum ciphertexts,
- decrypt result,
- compare with expected arithmetic output.

**Pass rule:**

- decrypted result matches expected output within defined tolerance,
- command exits with code `0`.

**Evidence produced:**

- console output log,
- decrypted value record,
- comparison result (`PASS` / `FAIL`).

#### `tests/integration/he_gateway_api_test.sh`

Will test:

- `/he/encrypt`
- `/he/sum`
- `/he/decrypt-test`

through the Rust API shell.

**Pass rule:**

- all endpoints return expected HTTP status,
- response JSON contains required fields,
- final decrypted test result matches expected sum.

**Evidence produced:**

- API request/response logs,
- saved endpoint response payloads.

#### `tests/integration/he_invalid_input_test.sh`

Will test:

- malformed ciphertext,
- missing amount field,
- invalid numeric payload,
- unsupported decrypt request.

**Pass rule:**

- service rejects invalid input,
- expected error code/message is returned,
- service remains healthy after rejection.

**Evidence produced:**

- error response log,
- service health check output.

#### `tests/fixtures/he_test_vectors.json`

Will store:

- input amounts for positive tests,
- malformed HE inputs for negative tests.

#### `tests/fixtures/he_expected_outputs.json`

Will store:

- expected decrypted values,
- accepted tolerance boundaries,
- expected error results for negative cases.

### Special Control

`/he/decrypt-test` must be treated as a **test-mode-only endpoint**.
It should be:

- clearly marked as non-production,
- disabled by default outside test mode,
- enabled only during controlled validation runs.

---

## 7.1.2 SMPC Equality Checks

### Feature Under Test

The SMPC flow must correctly:

- submit an entity ID for screening,
- execute the local MP-SPDZ flow,
- return `match` / `no_match`,
- remain consistent across repeated runs,
- reject invalid or incomplete input safely.

### Existing Files Under Test

```text
services/smpc-orchestrator/programs/sanction_check.mpc
services/smpc-orchestrator/programs/entity_match.mpc
services/smpc-orchestrator/programs/threshold_alert.mpc

services/smpc-orchestrator/runtime/Cargo.toml
services/smpc-orchestrator/runtime/src/main.rs
services/smpc-orchestrator/runtime/src/routes.rs
services/smpc-orchestrator/runtime/src/mp_spdz.rs
services/smpc-orchestrator/runtime/src/parser.rs

scripts/dev/run_mp_spdz_local.sh
scripts/dev/seed_sanction_list.sh
```

### New Test Files to Create

```text
tests/integration/smpc_match_test.sh
tests/integration/smpc_no_match_test.sh
tests/integration/smpc_api_test.sh
tests/integration/smpc_invalid_entity_test.sh
tests/fixtures/smpc_test_cases.json
```

### Responsibility of Each New File

#### `tests/integration/smpc_match_test.sh`

Will test:

- a known sanctioned entity,
- confirm result = `match`.

**Pass rule:**

- output exactly matches expected `match` result,
- repeated run produces same result.

**Evidence produced:**

- output log,
- sanctioned test case ID,
- result snapshot.

#### `tests/integration/smpc_no_match_test.sh`

Will test:

- a known clean entity,
- confirm result = `no_match`.

**Pass rule:**

- output exactly matches expected `no_match` result,
- repeated run produces same result.

**Evidence produced:**

- output log,
- clean test case ID,
- result snapshot.

#### `tests/integration/smpc_api_test.sh`

Will test:

- `/smpc/screen`

through the runtime API.

**Pass rule:**

- expected HTTP status is returned,
- response JSON includes screening result,
- result matches fixture expectation.

**Evidence produced:**

- API logs,
- response payload capture.

#### `tests/integration/smpc_invalid_entity_test.sh`

Will test:

- empty entity ID,
- malformed ID,
- unknown schema,
- missing payload fields.

**Pass rule:**

- invalid request is rejected cleanly,
- service returns defined error response,
- orchestrator remains healthy.

**Evidence produced:**

- rejection log,
- service health status after test.

#### `tests/fixtures/smpc_test_cases.json`

Will store:

- known sanctioned IDs,
- known clean IDs,
- malformed entity inputs,
- expected outputs.

---

## 7.1.3 zk-SNARK Proof Generation & Verification

### Feature Under Test

The proof layer must correctly:

- generate proof artifacts for:
  - **Rec. 10**
  - **Rec. 11**
  - **Rec. 16**
- store those artifacts,
- verify them through verifier logic,
- reject invalid or tampered proofs,
- preserve privacy by exposing proof status rather than raw protected data.

### Existing Files Under Test

```text
services/zk-prover/circuits/fatf-rec10/src/lib.rs
services/zk-prover/circuits/fatf-rec10/src/circuit.rs
services/zk-prover/circuits/fatf-rec10/src/tests.rs

services/zk-prover/circuits/fatf-rec11/src/lib.rs
services/zk-prover/circuits/fatf-rec11/src/circuit.rs
services/zk-prover/circuits/fatf-rec11/src/tests.rs

services/zk-prover/circuits/fatf-rec16/src/lib.rs
services/zk-prover/circuits/fatf-rec16/src/circuit.rs
services/zk-prover/circuits/fatf-rec16/src/tests.rs

services/zk-prover/prover/Cargo.toml
services/zk-prover/prover/src/main.rs
services/zk-prover/prover/src/routes.rs
services/zk-prover/prover/src/prove.rs

services/zk-prover/verifier/Cargo.toml
services/zk-prover/verifier/src/lib.rs
services/zk-prover/verifier/src/verify.rs

services/zk-prover/plugins/wasm/Cargo.toml
services/zk-prover/plugins/wasm/src/lib.rs
services/zk-prover/plugins/wasm/package.json
```

### New Test Files to Create

```text
tests/integration/zk_proof_generation_test.sh
tests/integration/zk_proof_verification_test.sh
tests/integration/zk_invalid_proof_test.sh
tests/compliance/rec10_proof_test.sh
tests/compliance/rec11_proof_test.sh
tests/compliance/rec16_proof_test.sh
tests/fixtures/zk_claim_cases.json
```

### Responsibility of Each New File

#### `tests/integration/zk_proof_generation_test.sh`

Will test:

- proof generation endpoint,
- proof storage,
- proof count and structure.

**Pass rule:**

- proof is created successfully,
- response includes proof ID and rule ID,
- proof record exists in storage.

**Evidence produced:**

- generated proof metadata,
- DB/storage lookup log,
- endpoint response record.

#### `tests/integration/zk_proof_verification_test.sh`

Will test:

- verification route,
- proof verification result,
- consistency of claim hash.

**Pass rule:**

- valid proof verifies successfully,
- returned verification status is `verified`,
- claim hash matches stored expectation.

**Evidence produced:**

- verifier response,
- claim hash comparison output.

#### `tests/integration/zk_invalid_proof_test.sh`

Will test:

- tampered proof,
- wrong claim hash,
- missing proof bytes,
- unsupported rule ID.

**Pass rule:**

- invalid proof is rejected,
- verifier returns expected failure result,
- no false positive verification occurs.

**Evidence produced:**

- verifier rejection log,
- invalid proof result trace.

#### `tests/compliance/rec10_proof_test.sh`

Will test:

- whether the technical proof for **Recommendation 10** is generated when required CDD-related checks exist.

**Pass rule:**

- proof exists,
- proof is linked to the expected transaction or claim context,
- proof verifies successfully.

**Evidence produced:**

- Rec. 10 proof metadata,
- verifier result.

#### `tests/compliance/rec11_proof_test.sh`

Will test:

- whether the technical proof for **Recommendation 11** is generated,
- whether stored records are traceable.

**Pass rule:**

- proof exists,
- linked record exists in audit store,
- linkage can be retrieved.

**Evidence produced:**

- proof record,
- linked audit retrieval result.

#### `tests/compliance/rec16_proof_test.sh`

Will test:

- whether the technical proof for **Recommendation 16** is generated for required metadata.

**Pass rule:**

- proof exists,
- required metadata presence is reflected in the claim path,
- proof verifies successfully.

**Evidence produced:**

- proof metadata,
- verification log.

#### `tests/fixtures/zk_claim_cases.json`

Will store:

- proof generation scenarios,
- expected rule-to-proof mappings,
- valid claim cases,
- invalid/tampered claim cases.

### Naming Clarification

There must be a clear distinction between:

- **`*_proof_test.sh`** → verifies that the **technical proof mechanism** works correctly.
- **`*_validation.sh`** → verifies that the generated artifacts actually support the **compliance objective stated in the report**.

This prevents proof-mechanism testing from being confused with report-level compliance validation.

---

## 7.1.4 API Flows End-to-End

### Feature Under Test

The integrated flow must work from:

- transaction submission,
- pseudonymization,
- screening,
- proof generation,
- proof verification,
- regulator API retrieval.

It must also reject malformed or incomplete transaction flows correctly.

### Existing Files Under Test

```text
services/encryption-service/api/src/main.rs
services/encryption-service/api/src/routes.rs
services/encryption-service/api/src/pseudonymize.rs
services/encryption-service/api/src/smpc_client.rs
services/encryption-service/fpe/mod.rs

services/he-orchestrator/rust-gateway/src/main.rs
services/he-orchestrator/rust-gateway/src/routes.rs
services/he-orchestrator/rust-gateway/src/ffi.rs

services/smpc-orchestrator/runtime/src/main.rs
services/smpc-orchestrator/runtime/src/routes.rs

services/zk-prover/prover/src/main.rs
services/zk-prover/prover/src/routes.rs

services/regulator-api/backend/src/main.rs
services/regulator-api/backend/src/routes.rs
services/regulator-api/backend/src/proofs.rs
services/regulator-api/backend/src/audit.rs
services/regulator-api/backend/src/db.rs
```

### New Test Files to Create

```text
tests/integration/api_end_to_end_test.sh
tests/integration/regulator_flow_test.sh
tests/integration/e2e_invalid_payload_test.sh
tests/fixtures/e2e_transactions.json
```

### Responsibility of Each New File

#### `tests/integration/api_end_to_end_test.sh`

Will test:

- submit transaction,
- pseudonymization response,
- SMPC screening trigger,
- proof generation,
- DB persistence.

**Pass rule:**

- every step returns success,
- expected records are persisted,
- final proof reference can be retrieved.

**Evidence produced:**

- full execution trace,
- database lookup results,
- generated proof ID.

#### `tests/integration/regulator_flow_test.sh`

Will test:

- list proofs,
- get proof,
- verify proof,
- get audit timeline.

**Pass rule:**

- regulator endpoints return expected status,
- proof retrieval matches stored proof,
- audit timeline is accessible.

**Evidence produced:**

- regulator API responses,
- proof and audit retrieval output.

#### `tests/integration/e2e_invalid_payload_test.sh`

Will test:

- missing sender/receiver metadata,
- missing travel-rule fields,
- malformed transaction payload,
- invalid transaction type.

**Pass rule:**

- system rejects bad payloads,
- expected validation error is returned,
- no invalid proof is generated,
- no inconsistent DB record is created.

**Evidence produced:**

- validation error log,
- DB non-creation confirmation.

#### `tests/fixtures/e2e_transactions.json`

Will store:

- canonical valid transactions,
- malformed transaction cases,
- missing metadata cases,
- expected outcomes.

---

# 7.2 Performance Tests

## Benchmark Goals

Using **Locust**, Phase 7 will measure:

- **1000 transactions < 5 seconds**
- **zk proof generation < 100 ms**

Performance testing must only be executed after functional and integration correctness are stable.

## Existing Files Involved in Performance Scope

```text
services/encryption-service/api/src/routes.rs
services/zk-prover/prover/src/routes.rs
services/regulator-api/backend/src/routes.rs
```

And the deployment / monitoring layer:

```text
infra/monitoring/prometheus/prometheus.yml
infra/monitoring/dashboards/service-latency.json
infra/monitoring/dashboards/proof-throughput.json
infra/monitoring/dashboards/cpu-usage.json
```

## New Performance Files to Create

```text
tests/performance/locustfile.py
tests/performance/transactions_load_test.py
tests/performance/proof_generation_load_test.py
tests/performance/performance_targets.md
tests/performance/performance_results_template.md
tests/fixtures/performance_transactions.json
```

## Responsibility of Each Performance File

#### `tests/performance/locustfile.py`

Master Locust entry point.

**Pass rule:**

- launches configured scenarios without script error,
- emits metrics required for benchmark recording.

**Evidence produced:**

- Locust run summary,
- generated throughput and latency outputs.

#### `tests/performance/transactions_load_test.py`

Will test:

- transaction submission throughput.

**Pass rule:**

- measured throughput satisfies target or deviation is documented,
- error rate stays within defined threshold.

**Evidence produced:**

- requests/sec,
- total transaction count,
- failure rate,
- mean and percentile latency.

#### `tests/performance/proof_generation_load_test.py`

Will test:

- proof generation latency and throughput.

**Pass rule:**

- mean or selected percentile proof generation latency remains within target,
- throughput result is recorded.

**Evidence produced:**

- proof latency metrics,
- proof generation count,
- failure rate.

#### `tests/performance/performance_targets.md`

Will define:

- benchmark targets,
- pass/fail thresholds,
- acceptable deviation handling,
- monitored metrics.

#### `tests/performance/performance_results_template.md`

Will hold:

- measured results,
- observations,
- deviations from targets,
- interpretation for report inclusion.

#### `tests/fixtures/performance_transactions.json`

Will store:

- batch payloads for synthetic benchmark runs.

---

# 7.3 Compliance Validation

## Validation Goals

This part of Phase 7 must prove:

- **Rec 10 → CDD proof generated**
- **Rec 11 → stored logs retrievable**
- **Rec 16 → travel-rule metadata proof generated**

This section is not only about proving that proof code runs.
It must prove that the system output supports the **report-level compliance claims**.

## Existing Files Under Compliance Validation

```text
services/zk-prover/circuits/fatf-rec10/src/lib.rs
services/zk-prover/circuits/fatf-rec11/src/lib.rs
services/zk-prover/circuits/fatf-rec16/src/lib.rs

services/zk-prover/prover/src/prove.rs
services/zk-prover/verifier/src/verify.rs

services/regulator-api/backend/src/proofs.rs
services/regulator-api/backend/src/audit.rs
services/regulator-api/backend/src/db.rs

infra/postgres/migrations/001_create_transactions.sql
infra/postgres/migrations/002_create_audit_logs.sql
infra/postgres/migrations/003_create_proofs.sql
infra/postgres/migrations/004_create_regulator_views.sql
infra/postgres/migrations/005_retention_policy.sql
```

## New Compliance Validation Files to Create

```text
tests/compliance/rec10_validation.sh
tests/compliance/rec11_validation.sh
tests/compliance/rec16_validation.sh
tests/compliance/compliance_assertions.md
tests/compliance/compliance_results_template.md
```

## Responsibility of Each Compliance File

#### `tests/compliance/rec10_validation.sh`

Will confirm:

- a Rec. 10-aligned proof exists for a valid transaction path,
- the proof is retrievable,
- the claim supports the intended CDD-related assertion.

**Pass rule:**

- proof exists,
- proof verifies,
- required linkage to expected transaction or claim context exists.

**Evidence produced:**

- validation log,
- proof ID,
- verification result,
- linkage result.

#### `tests/compliance/rec11_validation.sh`

Will confirm:

- audit logs are retrievable,
- proof-to-transaction linkage exists,
- record-handling evidence is present.

**Pass rule:**

- linked audit records are retrievable,
- proof-to-record relationship exists,
- query returns expected data without exposing restricted plaintext.

**Evidence produced:**

- audit retrieval output,
- linkage verification record.

#### `tests/compliance/rec16_validation.sh`

Will confirm:

- payment metadata fields are present,
- proof is generated,
- proof supports the intended travel-rule-style assertion.

**Pass rule:**

- required metadata is present in the scenario,
- proof exists and verifies,
- regulator retrieval succeeds.

**Evidence produced:**

- metadata presence check,
- proof verification output,
- regulator retrieval log.

#### `tests/compliance/compliance_assertions.md`

Will define:

- what exactly constitutes a pass for each recommendation,
- which fields, artifacts, and linkages must exist,
- which outputs are sufficient evidence for the report.

#### `tests/compliance/compliance_results_template.md`

Will store:

- compliance validation results,
- observed outputs,
- pass/fail summary,
- notes for final report and presentation.

---

# 7.4 Full List of New Phase 7 Files

## Functional / Integration

```text
tests/integration/he_encrypt_decrypt_test.sh
tests/integration/he_gateway_api_test.sh
tests/integration/he_invalid_input_test.sh
tests/integration/smpc_match_test.sh
tests/integration/smpc_no_match_test.sh
tests/integration/smpc_api_test.sh
tests/integration/smpc_invalid_entity_test.sh
tests/integration/zk_proof_generation_test.sh
tests/integration/zk_proof_verification_test.sh
tests/integration/zk_invalid_proof_test.sh
tests/integration/api_end_to_end_test.sh
tests/integration/regulator_flow_test.sh
tests/integration/e2e_invalid_payload_test.sh
```

## Performance

```text
tests/performance/locustfile.py
tests/performance/transactions_load_test.py
tests/performance/proof_generation_load_test.py
tests/performance/performance_targets.md
tests/performance/performance_results_template.md
```

## Compliance

```text
tests/compliance/rec10_proof_test.sh
tests/compliance/rec11_proof_test.sh
tests/compliance/rec16_proof_test.sh
tests/compliance/rec10_validation.sh
tests/compliance/rec11_validation.sh
tests/compliance/rec16_validation.sh
tests/compliance/compliance_assertions.md
tests/compliance/compliance_results_template.md
```

## Fixtures

```text
tests/fixtures/he_test_vectors.json
tests/fixtures/he_expected_outputs.json
tests/fixtures/smpc_test_cases.json
tests/fixtures/zk_claim_cases.json
tests/fixtures/e2e_transactions.json
tests/fixtures/performance_transactions.json
```

## Optional Orchestration Files

```text
scripts/demo/run-phase7-validation.sh
scripts/ci/test-functional.sh
scripts/ci/test-performance.sh
scripts/ci/test-compliance.sh
docs/research/phase7-validation-plan.md
docs/research/phase7-results.md
```

---

# 7.5 What Proves Phase 7 Passed

Phase 7 is considered passed only if:

- HE functional tests pass,
- SMPC functional tests pass,
- zk proof generation and verification tests pass,
- negative-path tests confirm safe rejection behavior,
- end-to-end API flow passes,
- performance benchmarks are measured and recorded,
- compliance assertions are validated,
- evidence artifacts are saved for report and demo use.

---

# 7.6 Expected Outcome of Phase 7

At the end of this phase, the project should produce:

- technical correctness evidence,
- benchmark measurements,
- compliance validation evidence,
- reusable logs and screenshots for the final report,
- and defensible validation material for the final presentation.

In short, Phase 7 must show that the system is:

- **working**,
- **measurable**,
- **compliance-aligned**,
- and **ready for academic defense/demo presentation**.
