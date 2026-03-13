use crate::mp_spdz;
use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Deserialize)]
pub struct ScreenRequest {
    pub tx_id: Option<String>,
    pub entity_id: i64
}

#[derive(Debug, Serialize)]
pub struct ScreenResponse {
    pub tx_id: Option<String>,
    pub entity_id: i64,
    pub screening_result: String
}

pub fn router() -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/smpc/screen", post(screen))
}

async fn health() -> impl IntoResponse {
    (StatusCode::OK, Json(json!({"status": "ok"})))
}

async fn screen(
    Json(req): Json<ScreenRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let matched = mp_spdz::run_sanction_check(req.entity_id).map_err(internal_error)?;

    let screening_result = if matched { "match" } else { "no_match" }.to_string();

    Ok((
        StatusCode::OK,
        Json(ScreenResponse {
            tx_id: req.tx_id,
            entity_id: req.entity_id,
            screening_result,
        }),
    ))
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