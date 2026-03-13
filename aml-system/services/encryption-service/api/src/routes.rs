use crate::pseudonymize::{
    pseudonymize_transaction, PseudonymizedTransaction, TransactionInput,
    TransactionSubmissionResponse,
};
use crate::smpc_client;
use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use chrono::Utc;
use serde_json::json;
use sha2::{Digest, Sha256};
use sqlx::PgPool;
use std::{env, sync::Arc};
use uuid::Uuid;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub pseudo_salt: Arc<String>,
    pub smpc_base_url: Arc<String>,
}

pub fn router(pool: PgPool) -> Router {
    let pseudo_salt = env::var("PSEUDO_SALT").unwrap_or_else(|_| "dev_demo_salt_change_me".into());
    let smpc_base_url =
        env::var("SMPC_BASE_URL").unwrap_or_else(|_| "http://127.0.0.1:8083".into());

    let state = AppState {
        pool,
        pseudo_salt: Arc::new(pseudo_salt),
        smpc_base_url: Arc::new(smpc_base_url),
    };

    Router::new()
        .route("/health", get(health))
        .route("/transactions/submit", post(submit_transaction))
        .with_state(state)
}

pub fn pseudonymize_identifier(raw: &str, salt: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(salt.as_bytes());
    hasher.update(b":");
    hasher.update(raw.as_bytes());
    let digest = hasher.finalize();
    let hexed = hex::encode(digest);
    format!("psd_{}", &hexed[..24])
}

pub fn derive_entity_id(raw: &str) -> i64 {
    let digits: String = raw.chars().filter(|c| c.is_ascii_digit()).collect();
    if digits.is_empty() {
        1000
    } else {
        1000 + digits.parse::<i64>().unwrap_or(0)
    }
}

async fn health() -> impl IntoResponse {
    (StatusCode::OK, Json(json!({ "status": "ok" })))
}

async fn submit_transaction(
    State(state): State<AppState>,
    Json(input): Json<TransactionInput>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let pseudo: PseudonymizedTransaction = pseudonymize_transaction(&input, &state.pseudo_salt);

    let sender_screen = smpc_client::screen_entity(
        &state.smpc_base_url,
        &pseudo.tx_id,
        pseudo.sender_entity_id,
    )
    .await
    .map_err(internal_error)?;

    let receiver_screen = smpc_client::screen_entity(
        &state.smpc_base_url,
        &pseudo.tx_id,
        pseudo.receiver_entity_id,
    )
    .await
    .map_err(internal_error)?;

    let final_status = if sender_screen.screening_result == "match"
        || receiver_screen.screening_result == "match"
    {
        "screened_match"
    } else {
        "screened_clear"
    };

    let mut tx = state.pool.begin().await.map_err(internal_error)?;

    sqlx::query(
        r#"
        INSERT INTO transactions
            (tx_id, sender_pseudo, receiver_pseudo, amount_cipher_ref, currency, transaction_type,
             originator_institution, beneficiary_institution, status, created_at)
        VALUES
            ($1, $2, $3, NULL, $4, $5, $6, $7, $8, $9)
        "#,
    )
    .bind(&pseudo.tx_id)
    .bind(&pseudo.sender_pseudo)
    .bind(&pseudo.receiver_pseudo)
    .bind(&pseudo.currency)
    .bind(&pseudo.transaction_type)
    .bind(&pseudo.originator_institution)
    .bind(&pseudo.beneficiary_institution)
    .bind(final_status)
    .bind(pseudo.timestamp)
    .execute(&mut *tx)
    .await
    .map_err(internal_error)?;

    let audit_event_id = Uuid::new_v4().to_string();

    sqlx::query(
        r#"
        INSERT INTO audit_logs
            (id, tx_id, event_type, event_status, event_ref, details, created_at)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7)
        "#,
    )
    .bind(Uuid::parse_str(&audit_event_id).unwrap())
    .bind(&pseudo.tx_id)
    .bind("transaction_submitted_and_pseudonymized")
    .bind("success")
    .bind(Option::<String>::None)
    .bind(json!({
        "sender_pseudo": pseudo.sender_pseudo,
        "receiver_pseudo": pseudo.receiver_pseudo,
        "sender_entity_id": pseudo.sender_entity_id,
        "receiver_entity_id": pseudo.receiver_entity_id,
        "timestamp": pseudo.timestamp,
    }))
    .bind(Utc::now())
    .execute(&mut *tx)
    .await
    .map_err(internal_error)?;

    sqlx::query(
        r#"
        INSERT INTO audit_logs
            (id, tx_id, event_type, event_status, event_ref, details, created_at)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7)
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(&pseudo.tx_id)
    .bind("sender_screening_completed")
    .bind(&sender_screen.screening_result)
    .bind(pseudo.sender_entity_id.to_string())
    .bind(json!({
        "entity_id": pseudo.sender_entity_id,
        "screening_result": sender_screen.screening_result
    }))
    .bind(Utc::now())
    .execute(&mut *tx)
    .await
    .map_err(internal_error)?;

    sqlx::query(
        r#"
        INSERT INTO audit_logs
            (id, tx_id, event_type, event_status, event_ref, details, created_at)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7)
        "#,
    )
    .bind(Uuid::new_v4())
    .bind(&pseudo.tx_id)
    .bind("receiver_screening_completed")
    .bind(&receiver_screen.screening_result)
    .bind(pseudo.receiver_entity_id.to_string())
    .bind(json!({
        "entity_id": pseudo.receiver_entity_id,
        "screening_result": receiver_screen.screening_result
    }))
    .bind(Utc::now())
    .execute(&mut *tx)
    .await
    .map_err(internal_error)?;

    tx.commit().await.map_err(internal_error)?;

    let response = TransactionSubmissionResponse {
        tx_id: pseudo.tx_id,
        sender_pseudo: pseudo.sender_pseudo,
        receiver_pseudo: pseudo.receiver_pseudo,
        sender_screening_result: sender_screen.screening_result,
        receiver_screening_result: receiver_screen.screening_result,
        status: final_status.to_string(),
        audit_event_id,
    };

    Ok((StatusCode::CREATED, Json(response)))
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