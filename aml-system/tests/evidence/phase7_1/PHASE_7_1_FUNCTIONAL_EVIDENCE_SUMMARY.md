# Phase 7.1 Functional Testing Evidence Summary

## Scope

Phase 7.1 validates functional correctness for:

- HE encryption/decryption flow
- SMPC match/no-match screening
- zk proof generation and verification readiness
- End-to-end API flow readiness

## Evidence Directory

```text
/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/tests/evidence/phase7_1
```

## Captured Logs

### api_end_to_end_test.log

```text
Running Phase 7.1 API end-to-end test...
DELETE 0
DELETE 0
DELETE 0
Starting SMPC runtime...
SMPC runtime is ready at http://127.0.0.1:8083
Starting encryption service...
Encryption service is ready at http://127.0.0.1:8081/health
Using existing zk prover at http://127.0.0.1:8084
Starting regulator API...
regulator API is ready at http://127.0.0.1:8085/health
Phase 7.1 API end-to-end test PASSED
```

### clean_project_structure.log

```text
│           ├── zk_invalid_proof_test_20260401T081515Z.log
│           ├── zk_invalid_proof_test_20260401T124228Z.log
│           ├── zk_proof_generation_test_20260401T081514Z.log
│           ├── zk_proof_generation_test_20260401T124228Z.log
│           ├── zk_proof_verification_test_20260401T081515Z.log
│           └── zk_proof_verification_test_20260401T124228Z.log
├── performance
│   ├── locustfile.py
│   ├── logs
│   │   ├── proof_measured_20260401T110310Z.log
│   │   ├── proof_measured_20260401T132949Z.log
│   │   ├── proof_warmup_20260401T110310Z.log
│   │   ├── proof_warmup_20260401T132949Z.log
│   │   ├── run_phase7_2_summary_20260401T110310Z.md
│   │   ├── run_phase7_2_summary_20260401T132949Z.md
│   │   ├── transaction_measured_20260401T110310Z.log
│   │   ├── transaction_measured_20260401T132949Z.log
│   │   ├── transaction_warmup_20260401T110310Z.log
│   │   └── transaction_warmup_20260401T132949Z.log
│   ├── performance_results_template.md
│   ├── performance_targets.md
│   ├── proof_generation_load_test.py
│   └── transactions_load_test.py
├── README.md
└── TEST_ORDER.md
scripts
├── ci
│   ├── build-all.sh
│   ├── package-demo.sh
│   ├── phase71_collect_route_context.sh
│   ├── phase71_collect_route_context.sh.bak.20260427T145551Z
│   ├── phase71_preflight_check.sh
│   ├── test-all.sh
│   ├── test-compliance.sh
│   ├── test-functional.sh
│   └── test-performance.sh
├── demo
│   ├── demo-env.sh
│   ├── run-phase2-demo.sh
│   ├── run-phase3-integrated-demo.sh
│   ├── run-phase4-demo.sh
│   ├── run-phase5-demo.sh
│   ├── run-phase6-demo.sh
│   ├── run_phase7_1.sh
│   ├── run_phase7_2.sh
│   ├── run_phase7_3.sh
│   ├── run-phase7-validation.sh
│   ├── seed-demo-data.sh
│   ├── start-local-stack.sh
│   ├── stop-local-stack.sh
│   └── verify-demo-prereqs.sh
└── dev
    ├── bootstrap-phase2.sh
    ├── bootstrap-tree.sh
    ├── check-env-consistency.sh
    ├── load-env.sh
    ├── run_mp_spdz_local.sh
    ├── run-phase3-integrated-demo.sh
    └── seed_sanction_list.sh
docs
├── architecture
├── archive
│   └── scaffolds
│       ├── PHASE6_SCAFFOLD_NOTE.md
│       └── phase6_scaffold.zip
├── compliance
│   ├── audit-traceability.md
│   ├── fatf-mapping.md
│   └── gdpr-controls.md
├── demo
│   ├── demo-environment-baseline.md
│   └── regulator-dashboard-demo.md
├── investor
├── research
│   ├── phase7-functional-plan.md
│   ├── phase-r0-stabilization-plan.md
│   └── phase-r1-regulator-frontend-plan.md
└── tutorials

93 directories, 309 files
```

### encryption_service.service.log

```text
warning: fields `tx_id` and `entity_id` are never read
  --> src/smpc_client.rs:12:9
   |
11 | pub struct ScreenResponse {
   |            -------------- fields in this struct
12 |     pub tx_id: String,
   |         ^^^^^
13 |     pub entity_id: i64,
   |         ^^^^^^^^^
   |
   = note: `ScreenResponse` has derived impls for the traits `Clone` and `Debug`, but these are intentionally ignored during dead code analysis
   = note: `#[warn(dead_code)]` (part of `#[warn(unused)]`) on by default

warning: `encryption-service-api` (bin "encryption-service-api") generated 1 warning
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.48s
     Running `services/encryption-service/api/target/debug/encryption-service-api`
[2m2026-04-27T15:14:18.861842Z[0m [32m INFO[0m [2mencryption_service_api[0m[2m:[0m encryption-service listening on 127.0.0.1:8081
[2m2026-04-27T15:35:05.655278Z[0m [33m WARN[0m [2msqlx::postgres::notice[0m[2m:[0m there is already a transaction in progress
[2m2026-04-27T15:35:05.655432Z[0m [33m WARN[0m [2msqlx::postgres::notice[0m[2m:[0m there is no transaction in progress
[2m2026-04-27T15:35:05.675369Z[0m [33m WARN[0m [2msqlx::postgres::notice[0m[2m:[0m there is no transaction in progress
[2m2026-04-27T15:35:05.677019Z[0m [33m WARN[0m [2msqlx::postgres::notice[0m[2m:[0m there is no transaction in progress
[2m2026-04-27T15:36:00.672219Z[0m [33m WARN[0m [2msqlx::postgres::notice[0m[2m:[0m there is no transaction in progress
[2m2026-04-27T15:36:00.672526Z[0m [33m WARN[0m [2msqlx::postgres::notice[0m[2m:[0m there is no transaction in progress
[2m2026-04-27T15:36:00.675796Z[0m [33m WARN[0m [2msqlx::postgres::notice[0m[2m:[0m there is no transaction in progress
[2m2026-04-27T15:36:00.681994Z[0m [33m WARN[0m [2msqlx::postgres::notice[0m[2m:[0m there is no transaction in progress
[2m2026-04-27T15:36:00.682036Z[0m [33m WARN[0m [2msqlx::postgres::notice[0m[2m:[0m there is no transaction in progress
[2m2026-04-27T15:36:00.682053Z[0m [33m WARN[0m [2msqlx::postgres::notice[0m[2m:[0m there is no transaction in progress
[2m2026-04-27T15:36:00.683824Z[0m [33m WARN[0m [2msqlx::postgres::notice[0m[2m:[0m there is no transaction in progress
[2m2026-04-27T15:36:00.683885Z[0m [33m WARN[0m [2msqlx::postgres::notice[0m[2m:[0m there is no transaction in progress
[2m2026-04-27T15:36:00.683970Z[0m [33m WARN[0m [2msqlx::postgres::notice[0m[2m:[0m there is no transaction in progress
```

### he_gateway_cargo_build.log

```text
   Compiling he-rust-gateway v0.1.0 (/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/rust-gateway)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 4.21s
```

### he_seal_build.log

```text
CMake Error: The current CMakeCache.txt directory /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build/CMakeCache.txt is different than the directory /home/kamb/Downloads/projects/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build where CMakeCache.txt was created. This may result in binaries being created in the wrong place. If you are not sure, reedit the CMakeCache.txt
CMake Error: The source "/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/CMakeLists.txt" does not match the source "/home/kamb/Downloads/projects/AML_SMPC/aml-system/services/he-orchestrator/seal-core/CMakeLists.txt" used to generate cache.  Re-run cmake with a different source directory.
CMake Error: The current CMakeCache.txt directory /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build/CMakeCache.txt is different than the directory /home/kamb/Downloads/projects/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build where CMakeCache.txt was created. This may result in binaries being created in the wrong place. If you are not sure, reedit the CMakeCache.txt
CMake Error: The source "/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/CMakeLists.txt" does not match the source "/home/kamb/Downloads/projects/AML_SMPC/aml-system/services/he-orchestrator/seal-core/CMakeLists.txt" used to generate cache.  Re-run cmake with a different source directory.
CMake Error: The current CMakeCache.txt directory /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build/CMakeCache.txt is different than the directory /home/kamb/Downloads/projects/AML_SMPC/aml-system/services/he-orchestrator/seal-core/build where CMakeCache.txt was created. This may result in binaries being created in the wrong place. If you are not sure, reedit the CMakeCache.txt
CMake Error: The source "/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/seal-core/CMakeLists.txt" does not match the source "/home/kamb/Downloads/projects/AML_SMPC/aml-system/services/he-orchestrator/seal-core/CMakeLists.txt" used to generate cache.  Re-run cmake with a different source directory.
```

### preflight_check.log

```text
Phase 7.1 Preflight Check
Project root: /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system

Checking required commands...
✅ command available: bash
✅ command available: python
✅ command available: cargo
✅ command available: curl
✅ command available: cmake

Checking Phase 7.1 directories...
✅ directory exists: tests/integration
✅ directory exists: tests/compliance
✅ directory exists: tests/fixtures
✅ directory exists: tests/evidence/phase7_1
✅ directory exists: scripts/ci

Checking fixture JSON files...
✅ file exists: tests/fixtures/he_test_vectors.json
✅ valid JSON: tests/fixtures/he_test_vectors.json
✅ file exists: tests/fixtures/he_expected_outputs.json
✅ valid JSON: tests/fixtures/he_expected_outputs.json
✅ file exists: tests/fixtures/smpc_test_cases.json
✅ valid JSON: tests/fixtures/smpc_test_cases.json
✅ file exists: tests/fixtures/zk_claim_cases.json
✅ valid JSON: tests/fixtures/zk_claim_cases.json
✅ file exists: tests/fixtures/e2e_transactions.json
✅ valid JSON: tests/fixtures/e2e_transactions.json

Checking collector script syntax...
✅ file exists: scripts/ci/phase71_collect_route_context.sh
✅ bash syntax valid: scripts/ci/phase71_collect_route_context.sh

Checking filtered project structure...
✅ filtered structure saved: /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/tests/evidence/phase7_1/checks/filtered_structure.log

✅ Phase 7.1 preflight passed.
```

### rec10_proof_test.log

```text
Running FATF REC10 proof compliance test...
DELETE 0
DELETE 0
DELETE 0
INSERT 0 1
INSERT 0 3
Using existing zk prover at http://127.0.0.1:8084
FATF REC10 proof compliance test PASSED
```

### rec11_proof_test.log

```text
Running FATF REC11 proof compliance test...
DELETE 0
DELETE 0
DELETE 0
INSERT 0 1
INSERT 0 3
Using existing zk prover at http://127.0.0.1:8084
FATF REC11 proof compliance test PASSED
```

### rec16_proof_test.log

```text
Running FATF REC16 proof compliance test...
DELETE 0
DELETE 0
DELETE 0
INSERT 0 1
INSERT 0 3
Using existing zk prover at http://127.0.0.1:8084
FATF REC16 proof compliance test PASSED
```

### regulator_api.service.log

```text
   Compiling regulator-api-backend v0.1.0 (/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/regulator-api/backend)
warning: struct `AuditTimelineItem` is never constructed
 --> src/audit.rs:4:12
  |
4 | pub struct AuditTimelineItem {
  |            ^^^^^^^^^^^^^^^^^
  |
  = note: `#[warn(dead_code)]` (part of `#[warn(unused)]`) on by default

warning: `regulator-api-backend` (bin "regulator-api-backend") generated 1 warning
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 5.09s
     Running `services/regulator-api/backend/target/debug/regulator-api-backend`
[2m2026-04-27T15:14:24.408122Z[0m [32m INFO[0m [2mregulator_api_backend[0m[2m:[0m regulator-api listening on 127.0.0.1:8085
```

### route_context.log

```text
    pub tx_id: String,
    pub event_type: String,
    pub event_status: String,
    pub event_ref: Option<String>,
    pub details: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

pub async fn list_proofs(
    pool: &PgPool,
    tx_id: Option<&str>,
) -> Result<Vec<RegulatorProofRow>, String> {
    if let Some(tx_id) = tx_id {
        sqlx::query_as::<_, RegulatorProofRow>(
            r#"
            SELECT id, tx_id, rule_id, claim_hash, public_signal, verification_status, created_at
            FROM v_regulator_proofs
            WHERE tx_id = $1
            ORDER BY created_at ASC
            "#,
        )
        .bind(tx_id)
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())
    } else {
        sqlx::query_as::<_, RegulatorProofRow>(
            r#"
            SELECT id, tx_id, rule_id, claim_hash, public_signal, verification_status, created_at
            FROM v_regulator_proofs
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())
    }
}

pub async fn get_proof(pool: &PgPool, proof_id: Uuid) -> Result<serde_json::Value, String> {
    let row = sqlx::query(
        r#"
        SELECT id, tx_id, rule_id, claim_hash, proof_blob, public_signal, verification_status, created_at
        FROM proofs
        WHERE id = $1
        "#,
    )
    .bind(proof_id)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "id": row.try_get::<Uuid, _>("id").map_err(|e| e.to_string())?.to_string(),
        "tx_id": row.try_get::<String, _>("tx_id").map_err(|e| e.to_string())?,
        "rule_id": row.try_get::<String, _>("rule_id").map_err(|e| e.to_string())?,
        "claim_hash": row.try_get::<String, _>("claim_hash").map_err(|e| e.to_string())?,
        "proof_blob": row.try_get::<serde_json::Value, _>("proof_blob").map_err(|e| e.to_string())?,
        "public_signal": row.try_get::<bool, _>("public_signal").map_err(|e| e.to_string())?,
        "verification_status": row.try_get::<String, _>("verification_status").map_err(|e| e.to_string())?,
        "created_at": row.try_get::<DateTime<Utc>, _>("created_at").map_err(|e| e.to_string())?
    }))
}

pub async fn list_audit_for_tx(pool: &PgPool, tx_id: &str) -> Result<Vec<AuditRow>, String> {
    sqlx::query_as::<_, AuditRow>(
        r#"
        SELECT id, tx_id, event_type, event_status, event_ref, details, created_at
        FROM v_regulator_audit_timeline
        WHERE tx_id = $1
        ORDER BY created_at ASC
        "#,
    )
    .bind(tx_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())
}
Route context saved to:
/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/tests/evidence/phase7_1/route_context
```

### smpc_match_test.log

```text
Running SMPC match test...
SMPC match test PASSED
```

### smpc_no_match_test.log

```text
Running SMPC no-match test...
SMPC no-match test PASSED
```

### smpc_runtime_cargo_build.log

```text
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.12s
```

### smpc_runtime.service.log

```text
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.05s
     Running `services/smpc-orchestrator/runtime/target/debug/runtime`
SMPC runtime listening on http://127.0.0.1:8083
```

### TX-PHASE73-R10-001_r10_cdd_validation.log

```text
Running Phase 7.3 R.10 Customer Due Diligence validation for TX-PHASE73-R10-001
DELETE 3
DELETE 3
DELETE 1
Using existing SMPC runtime at http://127.0.0.1:8083
Using existing encryption service at http://127.0.0.1:8081
Using existing zk prover at http://127.0.0.1:8084
Using existing regulator API at http://127.0.0.1:8085
R.10 Customer Due Diligence validation PASSED
```

### TX-PHASE73-R11-001_r11_recordkeeping_validation.log

```text
Running Phase 7.3 R.11 Record Keeping validation for TX-PHASE73-R11-001
DELETE 3
DELETE 3
DELETE 1
Using existing SMPC runtime at http://127.0.0.1:8083
Using existing encryption service at http://127.0.0.1:8081
Using existing zk prover at http://127.0.0.1:8084
Using existing regulator API at http://127.0.0.1:8085
R.11 Record Keeping validation PASSED
```

### TX-PHASE73-R16-001_r16_travelrule_validation.log

```text
Running Phase 7.3 R.16 Payment Transparency / Travel Rule validation for TX-PHASE73-R16-001
DELETE 3
DELETE 3
DELETE 1
Using existing SMPC runtime at http://127.0.0.1:8083
Using existing encryption service at http://127.0.0.1:8081
Using existing zk prover at http://127.0.0.1:8084
Using existing regulator API at http://127.0.0.1:8085
```

### zk_proof_generation_test.log

```text
Running zk proof generation test for tx_id=TX-PHASE71-ZK-001
DELETE 0
DELETE 0
DELETE 0
INSERT 0 1
INSERT 0 3
Starting zk prover...
zk prover is ready at http://127.0.0.1:8084/health
zk proof generation test PASSED
```

### zk_proof_verification_test.log

```text
Running zk proof verification test for tx_id=TX-PHASE71-ZKVERIFY-001
DELETE 0
DELETE 0
DELETE 0
INSERT 0 1
INSERT 0 3
Using existing zk prover at http://127.0.0.1:8084
zk proof verification test PASSED
```

### zk_prover_cargo_build.log

```text
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.76s
```

### zk_prover.service.log

```text
[2m2026-04-27T15:48:17.892450Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R10-001 rule_id=FATF_REC11
[2m2026-04-27T15:48:17.899160Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R10-001 rule_id=FATF_REC16
[2m2026-04-27T15:48:17.902818Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m generated proof set for tx_id=TX-PHASE73-R10-001 status=screened_clear
[2m2026-04-27T15:48:18.289684Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m proof generation started for tx_id=TX-PHASE73-R11-001
[2m2026-04-27T15:48:18.290413Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m transaction fetched for tx_id=TX-PHASE73-R11-001
[2m2026-04-27T15:48:18.299982Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m audit rows fetched for tx_id=TX-PHASE73-R11-001 count=3
[2m2026-04-27T15:48:18.300092Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC10 for tx_id=TX-PHASE73-R11-001
[2m2026-04-27T15:48:18.300528Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC11 for tx_id=TX-PHASE73-R11-001
[2m2026-04-27T15:48:18.300917Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC16 for tx_id=TX-PHASE73-R11-001
[2m2026-04-27T15:48:18.301452Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m prepared 3 proof artifacts for tx_id=TX-PHASE73-R11-001
[2m2026-04-27T15:48:18.301474Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R11-001 rule_id=FATF_REC10
[2m2026-04-27T15:48:18.304730Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R11-001 rule_id=FATF_REC11
[2m2026-04-27T15:48:18.307812Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R11-001 rule_id=FATF_REC16
[2m2026-04-27T15:48:18.311646Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m generated proof set for tx_id=TX-PHASE73-R11-001 status=screened_clear
[2m2026-04-27T15:48:18.835573Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m proof generation started for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:48:18.836372Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m transaction fetched for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:48:18.846061Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m audit rows fetched for tx_id=TX-PHASE73-R16-001 count=3
[2m2026-04-27T15:48:18.846144Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC10 for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:48:18.846583Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC11 for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:48:18.846969Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC16 for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:48:18.847616Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m prepared 3 proof artifacts for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:48:18.847653Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R16-001 rule_id=FATF_REC10
[2m2026-04-27T15:48:18.851622Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R16-001 rule_id=FATF_REC11
[2m2026-04-27T15:48:18.854449Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R16-001 rule_id=FATF_REC16
[2m2026-04-27T15:48:18.857360Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m generated proof set for tx_id=TX-PHASE73-R16-001 status=screened_clear
[2m2026-04-27T15:54:28.121465Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m proof generation started for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:54:28.122320Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m transaction fetched for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:54:28.132885Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m audit rows fetched for tx_id=TX-PHASE73-R16-001 count=3
[2m2026-04-27T15:54:28.132991Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC10 for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:54:28.134091Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC11 for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:54:28.134487Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC16 for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:54:28.135028Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m prepared 3 proof artifacts for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:54:28.135067Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R16-001 rule_id=FATF_REC10
[2m2026-04-27T15:54:28.138489Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R16-001 rule_id=FATF_REC11
[2m2026-04-27T15:54:28.146428Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R16-001 rule_id=FATF_REC16
[2m2026-04-27T15:54:28.156269Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m generated proof set for tx_id=TX-PHASE73-R16-001 status=screened_clear
[2m2026-04-27T15:57:44.096098Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m proof generation started for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:57:44.096930Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m transaction fetched for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:57:44.106584Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m audit rows fetched for tx_id=TX-PHASE73-R16-001 count=3
[2m2026-04-27T15:57:44.106698Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC10 for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:57:44.107180Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC11 for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:57:44.107614Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC16 for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:57:44.108224Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m prepared 3 proof artifacts for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:57:44.108252Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R16-001 rule_id=FATF_REC10
[2m2026-04-27T15:57:44.111231Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R16-001 rule_id=FATF_REC11
[2m2026-04-27T15:57:44.114295Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R16-001 rule_id=FATF_REC16
[2m2026-04-27T15:57:44.117040Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m generated proof set for tx_id=TX-PHASE73-R16-001 status=screened_clear
[2m2026-04-27T15:58:56.545979Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m proof generation started for tx_id=TX-PHASE73-R10-001
[2m2026-04-27T15:58:56.546753Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m transaction fetched for tx_id=TX-PHASE73-R10-001
[2m2026-04-27T15:58:56.555957Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m audit rows fetched for tx_id=TX-PHASE73-R10-001 count=3
[2m2026-04-27T15:58:56.556061Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC10 for tx_id=TX-PHASE73-R10-001
[2m2026-04-27T15:58:56.556741Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC11 for tx_id=TX-PHASE73-R10-001
[2m2026-04-27T15:58:56.557357Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC16 for tx_id=TX-PHASE73-R10-001
[2m2026-04-27T15:58:56.558131Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m prepared 3 proof artifacts for tx_id=TX-PHASE73-R10-001
[2m2026-04-27T15:58:56.558173Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R10-001 rule_id=FATF_REC10
[2m2026-04-27T15:58:56.562191Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R10-001 rule_id=FATF_REC11
[2m2026-04-27T15:58:56.564995Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R10-001 rule_id=FATF_REC16
[2m2026-04-27T15:58:56.572053Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m generated proof set for tx_id=TX-PHASE73-R10-001 status=screened_clear
[2m2026-04-27T15:58:56.939649Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m proof generation started for tx_id=TX-PHASE73-R11-001
[2m2026-04-27T15:58:56.940444Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m transaction fetched for tx_id=TX-PHASE73-R11-001
[2m2026-04-27T15:58:56.950587Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m audit rows fetched for tx_id=TX-PHASE73-R11-001 count=3
[2m2026-04-27T15:58:56.950663Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC10 for tx_id=TX-PHASE73-R11-001
[2m2026-04-27T15:58:56.951142Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC11 for tx_id=TX-PHASE73-R11-001
[2m2026-04-27T15:58:56.951550Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC16 for tx_id=TX-PHASE73-R11-001
[2m2026-04-27T15:58:56.952156Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m prepared 3 proof artifacts for tx_id=TX-PHASE73-R11-001
[2m2026-04-27T15:58:56.952186Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R11-001 rule_id=FATF_REC10
[2m2026-04-27T15:58:56.960749Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R11-001 rule_id=FATF_REC11
[2m2026-04-27T15:58:56.966449Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R11-001 rule_id=FATF_REC16
[2m2026-04-27T15:58:56.970995Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m generated proof set for tx_id=TX-PHASE73-R11-001 status=screened_clear
[2m2026-04-27T15:58:57.532682Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m proof generation started for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:58:57.533465Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m transaction fetched for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:58:57.541568Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m audit rows fetched for tx_id=TX-PHASE73-R16-001 count=3
[2m2026-04-27T15:58:57.541641Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC10 for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:58:57.542051Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC11 for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:58:57.542409Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m running FATF_REC16 for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:58:57.542933Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m prepared 3 proof artifacts for tx_id=TX-PHASE73-R16-001
[2m2026-04-27T15:58:57.542954Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R16-001 rule_id=FATF_REC10
[2m2026-04-27T15:58:57.549667Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R16-001 rule_id=FATF_REC11
[2m2026-04-27T15:58:57.557603Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m verifying/storing proof tx_id=TX-PHASE73-R16-001 rule_id=FATF_REC16
[2m2026-04-27T15:58:57.563315Z[0m [32m INFO[0m [2mzk_prover_service::prove[0m[2m:[0m generated proof set for tx_id=TX-PHASE73-R16-001 status=screened_clear
```

### zk_rec10_cargo_test.log

```text
error: manifest path `services/zk-prover/circuits/fatf-rec10/Cargo.toml` does not exist
```

