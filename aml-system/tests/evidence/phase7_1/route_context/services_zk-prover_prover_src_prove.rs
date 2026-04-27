use crate::{fatf_rec10, fatf_rec11, fatf_rec16};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
use sqlx::{PgPool, Row};
use uuid::Uuid;
use zk_verifier::{verify_proof_artifact, ProofArtifactRecord};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProofArtifact {
    pub id: String,
    pub tx_id: String,
    pub rule_id: String,
    pub claim_hash: String,
    pub proof_blob: Value,
    pub public_signal: bool,
    pub verification_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateProofsRequest {
    pub tx_id: String,
}

fn hash_json(value: &Value) -> Result<String, String> {
    let canonical = serde_json::to_vec(value).map_err(|e| e.to_string())?;
    let mut hasher = Sha256::new();
    hasher.update(&canonical);
    Ok(hex::encode(hasher.finalize()))
}

async fn fetch_transaction(
    pool: &PgPool,
    tx_id: &str,
) -> Result<Option<sqlx::postgres::PgRow>, String> {
    sqlx::query(
        r#"
        SELECT tx_id, originator_institution, beneficiary_institution, status
        FROM transactions
        WHERE tx_id = $1
        "#,
    )
    .bind(tx_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())
}

async fn fetch_audit_rows(
    pool: &PgPool,
    tx_id: &str,
) -> Result<Vec<sqlx::postgres::PgRow>, String> {
    sqlx::query(
        r#"
        SELECT event_type, event_status, event_ref, details
        FROM audit_logs
        WHERE tx_id = $1
        ORDER BY created_at ASC
        "#,
    )
    .bind(tx_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())
}

async fn store_proof(pool: &PgPool, artifact: &ProofArtifact) -> Result<(), String> {
    sqlx::query(
        r#"
        INSERT INTO proofs
            (id, tx_id, rule_id, claim_hash, proof_blob, public_signal, verification_status, created_at)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8)
        "#,
    )
    .bind(Uuid::parse_str(&artifact.id).unwrap())
    .bind(&artifact.tx_id)
    .bind(&artifact.rule_id)
    .bind(&artifact.claim_hash)
    .bind(&artifact.proof_blob)
    .bind(artifact.public_signal)
    .bind(&artifact.verification_status)
    .bind(Utc::now())
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub async fn generate_proofs_for_tx(
    pool: &PgPool,
    tx_id: &str,
) -> Result<Vec<ProofArtifact>, String> {
    tracing::info!("proof generation started for tx_id={}", tx_id);

    let tx_row = fetch_transaction(pool, tx_id).await?;
    let tx_row = tx_row.ok_or_else(|| format!("transaction not found: {}", tx_id))?;
    tracing::info!("transaction fetched for tx_id={}", tx_id);

    let audit_rows = fetch_audit_rows(pool, tx_id).await?;
    let audit_count = audit_rows.len() as u64;
    tracing::info!("audit rows fetched for tx_id={} count={}", tx_id, audit_count);

    let sender_screening_performed = audit_rows.iter().any(|r| {
        r.try_get::<String, _>("event_type")
            .map(|v| v == "sender_screening_completed")
            .unwrap_or(false)
    });

    let receiver_screening_performed = audit_rows.iter().any(|r| {
        r.try_get::<String, _>("event_type")
            .map(|v| v == "receiver_screening_completed")
            .unwrap_or(false)
    });

    let transaction_exists = true;

    let originator_institution_present = tx_row
        .try_get::<Option<String>, _>("originator_institution")
        .ok()
        .flatten()
        .map(|v| !v.trim().is_empty())
        .unwrap_or(false);

    let beneficiary_institution_present = tx_row
        .try_get::<Option<String>, _>("beneficiary_institution")
        .ok()
        .flatten()
        .map(|v| !v.trim().is_empty())
        .unwrap_or(false);

    let status = tx_row
        .try_get::<String, _>("status")
        .unwrap_or_else(|_| "unknown".into());

    tracing::info!("running FATF_REC10 for tx_id={}", tx_id);
    let rec10_claim = fatf_rec10::Rec10Claim {
        tx_id: tx_id.to_string(),
        cdd_check_executed: true,
        sender_screening_performed,
        receiver_screening_performed,
    };
    fatf_rec10::verify_claim_with_circuit(&rec10_claim)?;

    tracing::info!("running FATF_REC11 for tx_id={}", tx_id);
    let rec11_claim = fatf_rec11::Rec11Claim {
        tx_id: tx_id.to_string(),
        transaction_exists,
        audit_event_count: audit_count,
    };
    fatf_rec11::verify_claim_with_circuit(&rec11_claim)?;

    tracing::info!("running FATF_REC16 for tx_id={}", tx_id);
    let rec16_claim = fatf_rec16::Rec16Claim {
        tx_id: tx_id.to_string(),
        originator_institution_present,
        beneficiary_institution_present,
        payment_metadata_present: originator_institution_present
            && beneficiary_institution_present,
    };
    fatf_rec16::verify_claim_with_circuit(&rec16_claim)?;

    let rec10_blob = serde_json::to_value(&rec10_claim).map_err(|e| e.to_string())?;
    let rec11_blob = serde_json::to_value(&rec11_claim).map_err(|e| e.to_string())?;
    let rec16_blob = serde_json::to_value(&rec16_claim).map_err(|e| e.to_string())?;

    let mut artifacts = vec![
        ProofArtifact {
            id: Uuid::new_v4().to_string(),
            tx_id: tx_id.to_string(),
            rule_id: "FATF_REC10".into(),
            claim_hash: hash_json(&rec10_blob)?,
            proof_blob: rec10_blob,
            public_signal: rec10_claim.public_value() == 1,
            verification_status: "generated".into(),
        },
        ProofArtifact {
            id: Uuid::new_v4().to_string(),
            tx_id: tx_id.to_string(),
            rule_id: "FATF_REC11".into(),
            claim_hash: hash_json(&rec11_blob)?,
            proof_blob: rec11_blob,
            public_signal: rec11_claim.public_value() == 1,
            verification_status: "generated".into(),
        },
        ProofArtifact {
            id: Uuid::new_v4().to_string(),
            tx_id: tx_id.to_string(),
            rule_id: "FATF_REC16".into(),
            claim_hash: hash_json(&rec16_blob)?,
            proof_blob: rec16_blob,
            public_signal: rec16_claim.public_value() == 1,
            verification_status: "generated".into(),
        },
    ];

    tracing::info!(
        "prepared {} proof artifacts for tx_id={}",
        artifacts.len(),
        tx_id
    );

    for artifact in &mut artifacts {
        tracing::info!(
            "verifying/storing proof tx_id={} rule_id={}",
            artifact.tx_id,
            artifact.rule_id
        );

        let outcome = verify_proof_artifact(&ProofArtifactRecord {
            id: artifact.id.clone(),
            tx_id: artifact.tx_id.clone(),
            rule_id: artifact.rule_id.clone(),
            claim_hash: artifact.claim_hash.clone(),
            proof_blob: artifact.proof_blob.clone(),
            public_signal: artifact.public_signal,
            verification_status: artifact.verification_status.clone(),
        })?;

        artifact.verification_status = if outcome.verified {
            "verified".into()
        } else {
            "generated".into()
        };

        store_proof(pool, artifact).await?;
    }

    tracing::info!("generated proof set for tx_id={} status={}", tx_id, status);
    Ok(artifacts)
}

pub async fn get_proofs_for_tx(pool: &PgPool, tx_id: &str) -> Result<Vec<ProofArtifact>, String> {
    let rows = sqlx::query(
        r#"
        SELECT id, tx_id, rule_id, claim_hash, proof_blob, public_signal, verification_status
        FROM proofs
        WHERE tx_id = $1
        ORDER BY created_at ASC
        "#,
    )
    .bind(tx_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    let proofs = rows
        .into_iter()
        .map(|r| ProofArtifact {
            id: r.try_get::<Uuid, _>("id").unwrap().to_string(),
            tx_id: r.try_get::<String, _>("tx_id").unwrap(),
            rule_id: r.try_get::<String, _>("rule_id").unwrap(),
            claim_hash: r.try_get::<String, _>("claim_hash").unwrap(),
            proof_blob: r.try_get::<Value, _>("proof_blob").unwrap(),
            public_signal: r.try_get::<bool, _>("public_signal").unwrap(),
            verification_status: r.try_get::<String, _>("verification_status").unwrap(),
        })
        .collect();

    Ok(proofs)
}