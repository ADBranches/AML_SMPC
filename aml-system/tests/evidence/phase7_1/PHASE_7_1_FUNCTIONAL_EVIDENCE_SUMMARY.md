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

### he_gateway_cargo_build.log

```text
   Compiling he-rust-gateway v0.1.0 (/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/he-orchestrator/rust-gateway)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 4.21s
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

### smpc_runtime_cargo_build.log

```text
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.12s
```

### zk_prover_cargo_build.log

```text
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.76s
```

### zk_rec10_cargo_test.log

```text
error: manifest path `services/zk-prover/circuits/fatf-rec10/Cargo.toml` does not exist
```

