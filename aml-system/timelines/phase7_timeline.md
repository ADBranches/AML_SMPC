content = r'''# Phase 7 — Testing, Benchmarking & Validation Plan

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
