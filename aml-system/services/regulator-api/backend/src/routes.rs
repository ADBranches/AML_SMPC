use crate::{anomaly_cases, auth, db, proofs, transactions};
use axum::{
    extract::{Path, Query, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use serde_json::json;
use sqlx::PgPool;
use std::env;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct ProofQuery {
    pub tx_id: Option<String>,
}

pub fn router(pool: PgPool) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/proofs", get(list_proofs))
        .route("/proofs/:proof_id", get(get_proof))
        .route("/proofs/:proof_id/verify", post(verify_proof))
        .route("/audit/:tx_id", get(get_audit_timeline))
        .merge(auth::routes())
        .merge(transactions::routes())
        .merge(anomaly_cases::routes())
        .with_state(pool)
}

async fn health() -> impl IntoResponse {
    (StatusCode::OK, Json(json!({"status": "ok"})))
}

async fn list_proofs(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Query(query): Query<ProofQuery>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    auth::require_permission(&headers, "proofs:read")?;

    let proofs = db::list_proofs(&pool, query.tx_id.as_deref())
        .await
        .map_err(internal_error)?;

    Ok((StatusCode::OK, Json(proofs)))
}

async fn get_proof(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(proof_id): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    auth::require_permission(&headers, "proofs:read")?;

    let proof_id = Uuid::parse_str(&proof_id).map_err(internal_error)?;

    let proof = db::get_proof(&pool, proof_id)
        .await
        .map_err(internal_error)?;

    Ok((StatusCode::OK, Json(proof)))
}

async fn verify_proof(
    headers: HeaderMap,
    Path(proof_id): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    auth::require_permission(&headers, "proofs:verify")?;

    let zk_prover_base_url =
        env::var("ZK_PROVER_BASE_URL").unwrap_or_else(|_| "http://127.0.0.1:8084".into());

    let outcome = proofs::verify_proof_via_zk_service(&zk_prover_base_url, &proof_id)
        .await
        .map_err(internal_error)?;

    Ok((StatusCode::OK, Json(outcome)))
}

async fn get_audit_timeline(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(tx_id): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    auth::require_permission(&headers, "audit:read")?;

    let timeline = db::list_audit_for_tx(&pool, &tx_id)
        .await
        .map_err(internal_error)?;

    Ok((StatusCode::OK, Json(timeline)))
}

fn internal_error<E: std::fmt::Display>(err: E) -> (StatusCode, Json<serde_json::Value>) {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(json!({
            "error": "internal_server_error",
            "message": err.to_string()
        })),
    )
}
