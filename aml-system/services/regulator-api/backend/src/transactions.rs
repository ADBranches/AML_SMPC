use crate::auth;
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::{FromRow, PgPool};
use std::env;
use uuid::Uuid;

#[derive(Debug, Serialize, FromRow)]
pub struct TransactionWorkflowRow {
    pub id: Uuid,
    pub tx_id: String,
    pub payload: Value,
    pub status: String,
    pub submitted_by: Uuid,
    pub submitted_by_email: String,
    pub reviewed_by: Option<Uuid>,
    pub reviewer_email: Option<String>,
    pub review_note: Option<String>,
    pub submitted_at: DateTime<Utc>,
    pub reviewed_at: Option<DateTime<Utc>>,
    pub screening_started_at: Option<DateTime<Utc>>,
    pub screening_completed_at: Option<DateTime<Utc>>,
    pub proof_generated_at: Option<DateTime<Utc>>,
    pub last_error: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ReviewDecisionRequest {
    pub note: Option<String>,
}

pub fn routes() -> Router<PgPool> {
    Router::new()
        .route("/transactions", post(create_transaction).get(list_transactions))
        .route("/transactions/:tx_id", get(get_transaction))
        .route("/transactions/:tx_id/submit-for-review", post(submit_for_review))
        .route("/transactions/:tx_id/approve", post(approve_transaction))
        .route("/transactions/:tx_id/reject", post(reject_transaction))
        .route("/transactions/:tx_id/run-screening", post(run_screening))
        .route("/transactions/:tx_id/generate-proofs", post(generate_proofs))
}

async fn create_transaction(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Json(payload): Json<Value>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let claims = auth::require_permission(&headers, "transactions:create")?;
    let submitted_by = parse_user_id(&claims.sub)?;

    let tx_id = payload
        .get("tx_id")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim()
        .to_string();

    validate_transaction_payload(&payload, &tx_id)?;

    if transaction_exists(&pool, &tx_id).await? || workflow_exists(&pool, &tx_id).await? {
        return Err((
            StatusCode::CONFLICT,
            Json(json!({
                "error": "transaction_already_exists",
                "message": "A transaction/workflow with this tx_id already exists. Generate a fresh transaction ID.",
                "tx_id": tx_id
            })),
        ));
    }

    let row = sqlx::query_as::<_, TransactionWorkflowRow>(
        &workflow_select_sql(
            r#"
            INSERT INTO transaction_workflow_requests
                (tx_id, payload, status, submitted_by, submitted_at)
            VALUES
                ($1, $2, 'submitted', $3, NOW())
            RETURNING *
            "#,
        ),
    )
    .bind(&tx_id)
    .bind(&payload)
    .bind(submitted_by)
    .fetch_one(&pool)
    .await
    .map_err(internal_error)?;

    Ok((StatusCode::CREATED, Json(json!(row))))
}

async fn list_transactions(
    headers: HeaderMap,
    State(pool): State<PgPool>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let claims = auth::require_auth_claims(&headers)?;
    let user_id = parse_user_id(&claims.sub)?;

    let rows = match claims.role.as_str() {
        "transaction_submitter" => {
            sqlx::query_as::<_, TransactionWorkflowRow>(&workflow_select_sql(
                r#"
                SELECT *
                FROM transaction_workflow_requests
                WHERE submitted_by = $1
                ORDER BY submitted_at DESC
                "#,
            ))
            .bind(user_id)
            .fetch_all(&pool)
            .await
            .map_err(internal_error)?
        }
        "institution_admin" | "transaction_reviewer" => {
            sqlx::query_as::<_, TransactionWorkflowRow>(&workflow_select_sql(
                r#"
                SELECT *
                FROM transaction_workflow_requests
                ORDER BY submitted_at DESC
                "#,
            ))
            .fetch_all(&pool)
            .await
            .map_err(internal_error)?
        }
        _ => {
            return Err((
                StatusCode::FORBIDDEN,
                Json(json!({
                    "error": "insufficient_role",
                    "message": "Only institution roles can list transaction workflows.",
                    "current_role": claims.role
                })),
            ));
        }
    };

    Ok((StatusCode::OK, Json(json!(rows))))
}

async fn get_transaction(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(tx_id): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let claims = auth::require_auth_claims(&headers)?;
    let user_id = parse_user_id(&claims.sub)?;

    let row = fetch_workflow(&pool, &tx_id).await?;

    if claims.role == "transaction_submitter" && row.submitted_by != user_id {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({
                "error": "not_owner",
                "message": "Transaction submitters can only view their own transactions."
            })),
        ));
    }

    if !matches!(
        claims.role.as_str(),
        "transaction_submitter" | "transaction_reviewer" | "institution_admin"
    ) {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({
                "error": "insufficient_role",
                "message": "Your role cannot view institution transaction workflows.",
                "current_role": claims.role
            })),
        ));
    }

    Ok((StatusCode::OK, Json(json!(row))))
}

async fn submit_for_review(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(tx_id): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let claims = auth::require_permission(&headers, "transactions:create")?;
    let user_id = parse_user_id(&claims.sub)?;

    let row = fetch_workflow(&pool, &tx_id).await?;

    if row.submitted_by != user_id && claims.role != "institution_admin" {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({
                "error": "not_owner",
                "message": "Only the owner or institution admin can submit this transaction for review."
            })),
        ));
    }

    let row = update_status(
        &pool,
        &tx_id,
        "submitted",
        None,
        None,
        "Transaction submitted for review.",
    )
    .await?;

    Ok((StatusCode::OK, Json(json!(row))))
}

async fn approve_transaction(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(tx_id): Path<String>,
    Json(input): Json<ReviewDecisionRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let claims = auth::require_permission(&headers, "transactions:approve")?;
    let reviewer_id = parse_user_id(&claims.sub)?;

    let row = sqlx::query_as::<_, TransactionWorkflowRow>(
        &workflow_select_sql(
            r#"
            UPDATE transaction_workflow_requests
            SET status = 'approved',
                reviewed_by = $1,
                review_note = $2,
                reviewed_at = NOW(),
                last_error = NULL
            WHERE tx_id = $3
              AND status IN ('submitted', 'under_review', 'rejected')
            RETURNING *
            "#,
        ),
    )
    .bind(reviewer_id)
    .bind(input.note.unwrap_or_else(|| "Approved by reviewer.".to_string()))
    .bind(&tx_id)
    .fetch_optional(&pool)
    .await
    .map_err(internal_error)?
    .ok_or_else(|| {
        (
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "transaction_not_approvable",
                "message": "Transaction must be submitted/under_review/rejected before approval."
            })),
        )
    })?;

    Ok((StatusCode::OK, Json(json!(row))))
}

async fn reject_transaction(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(tx_id): Path<String>,
    Json(input): Json<ReviewDecisionRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let claims = auth::require_permission(&headers, "transactions:review")?;
    let reviewer_id = parse_user_id(&claims.sub)?;

    let row = sqlx::query_as::<_, TransactionWorkflowRow>(
        &workflow_select_sql(
            r#"
            UPDATE transaction_workflow_requests
            SET status = 'rejected',
                reviewed_by = $1,
                review_note = $2,
                reviewed_at = NOW()
            WHERE tx_id = $3
              AND status IN ('submitted', 'under_review', 'approved')
            RETURNING *
            "#,
        ),
    )
    .bind(reviewer_id)
    .bind(input.note.unwrap_or_else(|| "Rejected by reviewer.".to_string()))
    .bind(&tx_id)
    .fetch_optional(&pool)
    .await
    .map_err(internal_error)?
    .ok_or_else(|| {
        (
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "transaction_not_rejectable",
                "message": "Transaction must be submitted/under_review/approved before rejection."
            })),
        )
    })?;

    Ok((StatusCode::OK, Json(json!(row))))
}

async fn run_screening(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(tx_id): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    auth::require_permission(&headers, "transactions:approve")?;

    let row = fetch_workflow(&pool, &tx_id).await?;

    if row.status != "approved" && row.status != "screening_failed" {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "transaction_not_approved",
                "message": "Only approved transactions can proceed to screening.",
                "current_status": row.status
            })),
        ));
    }

    sqlx::query(
        r#"
        UPDATE transaction_workflow_requests
        SET screening_started_at = NOW(), last_error = NULL
        WHERE tx_id = $1
        "#,
    )
    .bind(&tx_id)
    .execute(&pool)
    .await
    .map_err(internal_error)?;

    let encryption_base_url = env::var("ENCRYPTION_SERVICE_BASE_URL")
        .unwrap_or_else(|_| "http://127.0.0.1:8081".to_string());

    let client = reqwest::Client::new();
    let response = client
        .post(format!("{}/transactions/submit", encryption_base_url))
        .json(&row.payload)
        .send()
        .await
        .map_err(internal_error)?;

    let status = response.status();
    let body = response.text().await.map_err(internal_error)?;
    let parsed_body: Value = serde_json::from_str(&body).unwrap_or_else(|_| json!({ "raw": body }));

    if !status.is_success() {
        sqlx::query(
            r#"
            UPDATE transaction_workflow_requests
            SET status = 'screening_failed',
                last_error = $2
            WHERE tx_id = $1
            "#,
        )
        .bind(&tx_id)
        .bind(parsed_body.to_string())
        .execute(&pool)
        .await
        .map_err(internal_error)?;

        return Err((
            StatusCode::BAD_GATEWAY,
            Json(json!({
                "error": "screening_failed",
                "message": "Encryption/SMPC screening service rejected the request.",
                "service_status": status.as_u16(),
                "details": parsed_body
            })),
        ));
    }

    let updated = sqlx::query_as::<_, TransactionWorkflowRow>(
        &workflow_select_sql(
            r#"
            UPDATE transaction_workflow_requests
            SET status = 'screened',
                screening_completed_at = NOW(),
                last_error = NULL
            WHERE tx_id = $1
            RETURNING *
            "#,
        ),
    )
    .bind(&tx_id)
    .fetch_one(&pool)
    .await
    .map_err(internal_error)?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "workflow": updated,
            "screening_response": parsed_body
        })),
    ))
}

async fn generate_proofs(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(tx_id): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    auth::require_permission(&headers, "proofs:generate")?;

    let row = fetch_workflow(&pool, &tx_id).await?;

    if row.status != "screened" && row.status != "proof_failed" && row.status != "proof_generated" {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "transaction_not_screened",
                "message": "Only screened transactions can generate proofs.",
                "current_status": row.status
            })),
        ));
    }

    let zk_prover_base_url =
        env::var("ZK_PROVER_BASE_URL").unwrap_or_else(|_| "http://127.0.0.1:8084".to_string());

    let client = reqwest::Client::new();
    let response = client
        .post(format!("{}/proofs/generate", zk_prover_base_url))
        .json(&json!({ "tx_id": tx_id }))
        .send()
        .await
        .map_err(internal_error)?;

    let status = response.status();
    let body = response.text().await.map_err(internal_error)?;
    let parsed_body: Value = serde_json::from_str(&body).unwrap_or_else(|_| json!({ "raw": body }));

    if !status.is_success() {
        sqlx::query(
            r#"
            UPDATE transaction_workflow_requests
            SET status = 'proof_failed',
                last_error = $2
            WHERE tx_id = $1
            "#,
        )
        .bind(&tx_id)
        .bind(parsed_body.to_string())
        .execute(&pool)
        .await
        .map_err(internal_error)?;

        return Err((
            StatusCode::BAD_GATEWAY,
            Json(json!({
                "error": "proof_generation_failed",
                "message": "zk proof service rejected the request.",
                "service_status": status.as_u16(),
                "details": parsed_body
            })),
        ));
    }

    let updated = sqlx::query_as::<_, TransactionWorkflowRow>(
        &workflow_select_sql(
            r#"
            UPDATE transaction_workflow_requests
            SET status = 'proof_generated',
                proof_generated_at = NOW(),
                last_error = NULL
            WHERE tx_id = $1
            RETURNING *
            "#,
        ),
    )
    .bind(&tx_id)
    .fetch_one(&pool)
    .await
    .map_err(internal_error)?;

    Ok((
        StatusCode::OK,
        Json(json!({
            "workflow": updated,
            "proof_response": parsed_body
        })),
    ))
}

fn workflow_select_sql(inner_sql: &str) -> String {
    format!(
        r#"
        WITH workflow_base AS (
            {}
        )
        SELECT
            w.id,
            w.tx_id,
            w.payload,
            w.status,
            w.submitted_by,
            submitter.email AS submitted_by_email,
            w.reviewed_by,
            reviewer.email AS reviewer_email,
            w.review_note,
            w.submitted_at,
            w.reviewed_at,
            w.screening_started_at,
            w.screening_completed_at,
            w.proof_generated_at,
            w.last_error
        FROM workflow_base w
        LEFT JOIN app_users submitter ON submitter.id = w.submitted_by
        LEFT JOIN app_users reviewer ON reviewer.id = w.reviewed_by
        "#,
        inner_sql
    )
}

async fn fetch_workflow(
    pool: &PgPool,
    tx_id: &str,
) -> Result<TransactionWorkflowRow, (StatusCode, Json<Value>)> {
    sqlx::query_as::<_, TransactionWorkflowRow>(&workflow_select_sql(
        r#"
        SELECT *
        FROM transaction_workflow_requests
        WHERE tx_id = $1
        "#,
    ))
    .bind(tx_id)
    .fetch_optional(pool)
    .await
    .map_err(internal_error)?
    .ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({
                "error": "transaction_workflow_not_found",
                "message": "No transaction workflow was found for this tx_id."
            })),
        )
    })
}

async fn update_status(
    pool: &PgPool,
    tx_id: &str,
    status: &str,
    reviewed_by: Option<Uuid>,
    review_note: Option<String>,
    fallback_note: &str,
) -> Result<TransactionWorkflowRow, (StatusCode, Json<Value>)> {
    sqlx::query_as::<_, TransactionWorkflowRow>(&workflow_select_sql(
        r#"
        UPDATE transaction_workflow_requests
        SET status = $1,
            reviewed_by = COALESCE($2, reviewed_by),
            review_note = COALESCE($3, review_note),
            reviewed_at = CASE WHEN $2 IS NULL THEN reviewed_at ELSE NOW() END
        WHERE tx_id = $4
        RETURNING *
        "#,
    ))
    .bind(status)
    .bind(reviewed_by)
    .bind(review_note.unwrap_or_else(|| fallback_note.to_string()))
    .bind(tx_id)
    .fetch_one(pool)
    .await
    .map_err(internal_error)
}

async fn workflow_exists(pool: &PgPool, tx_id: &str) -> Result<bool, (StatusCode, Json<Value>)> {
    let exists = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM transaction_workflow_requests WHERE tx_id = $1)",
    )
    .bind(tx_id)
    .fetch_one(pool)
    .await
    .map_err(internal_error)?;

    Ok(exists)
}

async fn transaction_exists(pool: &PgPool, tx_id: &str) -> Result<bool, (StatusCode, Json<Value>)> {
    let exists = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM transactions WHERE tx_id = $1)",
    )
    .bind(tx_id)
    .fetch_one(pool)
    .await
    .map_err(internal_error)?;

    Ok(exists)
}

fn validate_transaction_payload(payload: &Value, tx_id: &str) -> Result<(), (StatusCode, Json<Value>)> {
    let required_strings = [
        "tx_id",
        "sender_id",
        "receiver_id",
        "currency",
        "transaction_type",
        "originator_name",
        "beneficiary_name",
        "originator_institution",
        "beneficiary_institution",
        "timestamp",
    ];

    let mut errors = Vec::new();

    if tx_id.is_empty() {
        errors.push("tx_id is required".to_string());
    }

    for field in required_strings {
        if payload.get(field).and_then(Value::as_str).unwrap_or("").trim().is_empty() {
            errors.push(format!("{} is required", field));
        }
    }

    for field in ["sender_entity_id", "receiver_entity_id", "amount"] {
        if payload.get(field).and_then(Value::as_f64).unwrap_or(0.0) <= 0.0 {
            errors.push(format!("{} must be greater than zero", field));
        }
    }

    if !errors.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "validation_failed",
                "message": "Transaction payload validation failed.",
                "details": errors
            })),
        ));
    }

    Ok(())
}

fn parse_user_id(value: &str) -> Result<Uuid, (StatusCode, Json<Value>)> {
    Uuid::parse_str(value).map_err(|err| {
        (
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "error": "invalid_user_id",
                "message": err.to_string()
            })),
        )
    })
}

fn internal_error<E: std::fmt::Display>(err: E) -> (StatusCode, Json<Value>) {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(json!({
            "error": "internal_server_error",
            "message": err.to_string()
        })),
    )
}
