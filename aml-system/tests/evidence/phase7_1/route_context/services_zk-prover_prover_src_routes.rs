use crate::prove::{generate_proofs_for_tx, get_proofs_for_tx, GenerateProofsRequest};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde_json::json;
use sqlx::{PgPool, Row};
use zk_verifier::{verify_proof_artifact, ProofArtifactRecord};

pub fn router(pool: PgPool) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/proofs/generate", post(generate))
        .route("/proofs/tx/:tx_id", get(list_by_tx))
        .route("/proofs/:proof_id/verify", post(verify_by_id))
        .with_state(pool)
}

async fn health() -> impl IntoResponse {
    (StatusCode::OK, Json(json!({"status": "ok"})))
}

async fn generate(
    State(pool): State<PgPool>,
    Json(req): Json<GenerateProofsRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let proofs = generate_proofs_for_tx(&pool, &req.tx_id)
        .await
        .map_err(internal_error)?;
    Ok((StatusCode::OK, Json(proofs)))
}

async fn list_by_tx(
    State(pool): State<PgPool>,
    Path(tx_id): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let proofs = get_proofs_for_tx(&pool, &tx_id)
        .await
        .map_err(internal_error)?;
    Ok((StatusCode::OK, Json(proofs)))
}

async fn verify_by_id(
    State(pool): State<PgPool>,
    Path(proof_id): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let row = sqlx::query(
        r#"
        SELECT id, tx_id, rule_id, claim_hash, proof_blob, public_signal, verification_status
        FROM proofs
        WHERE id = $1
        "#,
    )
    .bind(uuid::Uuid::parse_str(&proof_id).map_err(internal_error)?)
    .fetch_one(&pool)
    .await
    .map_err(internal_error)?;

    let record = ProofArtifactRecord {
        id: row.try_get::<uuid::Uuid, _>("id").unwrap().to_string(),
        tx_id: row.try_get::<String, _>("tx_id").unwrap(),
        rule_id: row.try_get::<String, _>("rule_id").unwrap(),
        claim_hash: row.try_get::<String, _>("claim_hash").unwrap(),
        proof_blob: row.try_get::<serde_json::Value, _>("proof_blob").unwrap(),
        public_signal: row.try_get::<bool, _>("public_signal").unwrap(),
        verification_status: row.try_get::<String, _>("verification_status").unwrap(),
    };

    let outcome = verify_proof_artifact(&record).map_err(internal_error)?;
    Ok((StatusCode::OK, Json(outcome)))
}

fn internal_error<E: std::fmt::Display>(err: E) -> (StatusCode, Json<serde_json::Value>) {
    let msg = err.to_string();
    tracing::error!("zk-prover internal error: {}", msg);

    (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(json!({
            "error": "internal_server_error",
            "message": msg
        })),
    )
}