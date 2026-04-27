use crate::ffi;
use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Deserialize)]
pub struct EncryptRequest {
    pub amount: f64,
}

#[derive(Debug, Serialize)]
pub struct EncryptResponse {
    pub ciphertext_hex: String,
}

#[derive(Debug, Deserialize)]
pub struct SumRequest {
    pub lhs_ciphertext_hex: String,
    pub rhs_ciphertext_hex: String,
}

#[derive(Debug, Serialize)]
pub struct SumResponse {
    pub result_ciphertext_hex: String,
}

#[derive(Debug, Deserialize)]
pub struct DecryptRequest {
    pub ciphertext_hex: String,
}

#[derive(Debug, Serialize)]
pub struct DecryptResponse {
    pub amount: f64,
}

pub fn router() -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/he/encrypt", post(encrypt))
        .route("/he/sum", post(sum))
        .route("/he/decrypt-test", post(decrypt_test))
}

async fn health() -> impl IntoResponse {
    (StatusCode::OK, Json(json!({"status": "ok"})))
}

async fn encrypt(
    Json(req): Json<EncryptRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let ciphertext_hex = ffi::encrypt_amount(req.amount).map_err(internal_error)?;
    Ok((StatusCode::OK, Json(EncryptResponse { ciphertext_hex })))
}

async fn sum(
    Json(req): Json<SumRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let result_ciphertext_hex =
        ffi::sum_ciphertexts(&req.lhs_ciphertext_hex, &req.rhs_ciphertext_hex)
            .map_err(internal_error)?;

    Ok((
        StatusCode::OK,
        Json(SumResponse {
            result_ciphertext_hex,
        }),
    ))
}

async fn decrypt_test(
    Json(req): Json<DecryptRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let amount = ffi::decrypt_amount(&req.ciphertext_hex).map_err(internal_error)?;
    Ok((StatusCode::OK, Json(DecryptResponse { amount })))
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