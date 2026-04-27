use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, Row};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct RegulatorProofRow {
    pub id: Uuid,
    pub tx_id: String,
    pub rule_id: String,
    pub claim_hash: String,
    pub public_signal: bool,
    pub verification_status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AuditRow {
    pub id: Uuid,
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