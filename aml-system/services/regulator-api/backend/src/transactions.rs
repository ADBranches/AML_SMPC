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
    pub risk_score: Option<i32>,
    pub risk_level: Option<String>,
    pub suspicion_status: Option<String>,
    pub triggered_rules: Option<Value>,
    pub recommended_action: Option<String>,
    pub risk_review_notes: Option<String>,
    pub risk_screened_by: Option<Uuid>,
    pub risk_screened_by_email: Option<String>,
    pub risk_screened_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct ReviewDecisionRequest {
    pub note: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RiskEvaluationRequest {
    pub review_notes: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct TriggeredRiskRule {
    pub rule_code: String,
    pub rule_name: String,
    pub risk_weight: i32,
    pub reason: String,
}

#[derive(Debug, Serialize)]
pub struct RiskEvaluationResponse {
    pub tx_id: String,
    pub risk_score: i32,
    pub risk_level: String,
    pub suspicion_status: String,
    pub triggered_rules: Vec<TriggeredRiskRule>,
    pub recommended_action: String,
    pub reviewer: String,
    pub screened_at: DateTime<Utc>,
    pub workflow: TransactionWorkflowRow,
}

#[derive(Debug, FromRow)]
struct AmlRuleLookupRow {
    rule_code: String,
    rule_name: String,
    risk_weight: i32,
}

pub fn routes() -> Router<PgPool> {
    Router::new()
        .route("/transactions", post(create_transaction).get(list_transactions))
        .route("/transactions/:tx_id", get(get_transaction))
        .route("/transactions/:tx_id/submit-for-review", post(submit_for_review))
        .route("/transactions/:tx_id/approve", post(approve_transaction))
        .route("/transactions/:tx_id/reject", post(reject_transaction))
        .route("/transactions/:tx_id/evaluate-risk", post(evaluate_risk))
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


async fn evaluate_risk(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(tx_id): Path<String>,
    input: Option<Json<RiskEvaluationRequest>>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let claims = auth::require_permission(&headers, "transactions:flag_suspicious")?;
    let reviewer_id = parse_user_id(&claims.sub)?;

    let row = fetch_workflow(&pool, &tx_id).await?;
    let payload = &row.payload;

    let review_notes = input
        .map(|Json(request)| request.review_notes)
        .flatten()
        .unwrap_or_else(|| "Bank-side AML risk evaluation executed by reviewer.".to_string());

    let mut triggered_rules: Vec<TriggeredRiskRule> = Vec::new();

    let amount = json_number(payload, &["amount", "transaction_amount", "amount_value"])
        .unwrap_or(0.0);

    if amount >= 100000.0 {
        if let Some(rule) = load_rule_hit(
            &pool,
            "AMOUNT_HIGH_VALUE",
            25,
            "Transaction amount meets or exceeds the high-value review threshold.",
        )
        .await?
        {
            triggered_rules.push(rule);
        }
    }

    let originator = json_string(
        payload,
        &["originator_institution", "originator_bank", "sender_institution"],
    )
    .unwrap_or_default();

    let beneficiary = json_string(
        payload,
        &["beneficiary_institution", "beneficiary_bank", "receiver_institution"],
    )
    .unwrap_or_default();

    if originator.trim().is_empty() || beneficiary.trim().is_empty() {
        if let Some(rule) = load_rule_hit(
            &pool,
            "MISSING_PAYMENT_TRANSPARENCY",
            30,
            "Originator or beneficiary institution metadata is missing.",
        )
        .await?
        {
            triggered_rules.push(rule);
        }
    }

    if !originator.trim().is_empty()
        && !beneficiary.trim().is_empty()
        && originator.to_lowercase() != beneficiary.to_lowercase()
    {
        if let Some(rule) = load_rule_hit(
            &pool,
            "CROSS_BORDER_TRANSFER",
            15,
            "Originator and beneficiary institutions differ, requiring cross-institution AML review.",
        )
        .await?
        {
            triggered_rules.push(rule);
        }
    }

    let text_blob = payload.to_string().to_lowercase();

    if contains_any(
        &text_blob,
        &["watchlist", "sanction", "sanctions", "blocked", "high_risk", "high-risk"],
    ) {
        if let Some(rule) = load_rule_hit(
            &pool,
            "SANCTIONS_SCREEN_ATTENTION",
            50,
            "Payload contains watchlist, sanctions, blocked, or high-risk screening indicators.",
        )
        .await?
        {
            triggered_rules.push(rule);
        }
    }

    if contains_any(
        &text_blob,
        &["counterparty_risk", "high_risk_counterparty", "shared_counterparty"],
    ) {
        if let Some(rule) = load_rule_hit(
            &pool,
            "HIGH_RISK_COUNTERPARTY",
            30,
            "Counterparty indicators suggest enhanced review is required.",
        )
        .await?
        {
            triggered_rules.push(rule);
        }
    }

    if contains_any(
        &text_blob,
        &["cdd_incomplete", "kyc_incomplete", "missing_cdd", "due_diligence_incomplete"],
    ) {
        if let Some(rule) = load_rule_hit(
            &pool,
            "CDD_INCOMPLETE",
            25,
            "Customer due diligence or KYC metadata appears incomplete.",
        )
        .await?
        {
            triggered_rules.push(rule);
        }
    }

    let smpc_overlap = json_number(
        payload,
        &[
            "possible_cross_bank_overlap_count",
            "cross_bank_overlap_count",
            "smpc_overlap_count",
        ],
    )
    .unwrap_or(0.0);

    if smpc_overlap > 0.0 || contains_any(&text_blob, &["shared_counterparty_hash", "smpc_overlap"]) {
        if let Some(rule) = load_rule_hit(
            &pool,
            "SMPC_CROSS_BANK_OVERLAP",
            35,
            "Privacy-preserving SMPC indicators suggest cross-bank overlap evidence.",
        )
        .await?
        {
            triggered_rules.push(rule);
        }
    }

    let risk_score: i32 = triggered_rules.iter().map(|rule| rule.risk_weight).sum();

    let risk_level = if risk_score >= 70 {
        "high"
    } else if risk_score >= 40 {
        "medium"
    } else {
        "low"
    };

    let suspicion_status = if risk_score >= 70 {
        "suspicious"
    } else if risk_score >= 40 {
        "under_review"
    } else {
        "not_suspicious"
    };

    let recommended_action = match suspicion_status {
        "suspicious" => "Escalate for regulator-verifiable proof generation and anomaly case review.",
        "under_review" => "Reviewer should complete enhanced due diligence before proof generation.",
        _ => "Proceed with normal AML workflow monitoring.",
    }
    .to_string();

    let sender_pseudo = json_string(payload, &["sender_pseudo", "sender_id", "originator_id"])
        .unwrap_or_else(|| "unknown_sender".to_string());

    let receiver_pseudo =
        json_string(payload, &["receiver_pseudo", "receiver_id", "beneficiary_id"])
            .unwrap_or_else(|| "unknown_receiver".to_string());

    let amount_cipher_ref = json_string(payload, &["amount_cipher_ref", "amount_ref"])
        .or_else(|| Some(format!("amount:{}", amount)));

    let currency = json_string(payload, &["currency"]).unwrap_or_else(|| "USD".to_string());

    let transaction_type =
        json_string(payload, &["transaction_type"]).unwrap_or_else(|| "wire_transfer".to_string());

    let triggered_rules_json = json!(triggered_rules);
    let screened_at = Utc::now();

    sqlx::query(
        r#"
        INSERT INTO transactions
            (tx_id, sender_pseudo, receiver_pseudo, amount_cipher_ref, currency,
             transaction_type, originator_institution, beneficiary_institution, status,
             risk_score, risk_level, suspicion_status, triggered_rules,
             recommended_action, review_notes, screened_by, screened_at, created_at)
        VALUES
            ($1, $2, $3, $4, $5,
             $6, $7, $8, $9,
             $10, $11, $12, $13,
             $14, $15, $16, $17, NOW())
        ON CONFLICT (tx_id) DO UPDATE
        SET sender_pseudo = EXCLUDED.sender_pseudo,
            receiver_pseudo = EXCLUDED.receiver_pseudo,
            amount_cipher_ref = EXCLUDED.amount_cipher_ref,
            currency = EXCLUDED.currency,
            transaction_type = EXCLUDED.transaction_type,
            originator_institution = EXCLUDED.originator_institution,
            beneficiary_institution = EXCLUDED.beneficiary_institution,
            risk_score = EXCLUDED.risk_score,
            risk_level = EXCLUDED.risk_level,
            suspicion_status = EXCLUDED.suspicion_status,
            triggered_rules = EXCLUDED.triggered_rules,
            recommended_action = EXCLUDED.recommended_action,
            review_notes = EXCLUDED.review_notes,
            screened_by = EXCLUDED.screened_by,
            screened_at = EXCLUDED.screened_at
        "#,
    )
    .bind(&tx_id)
    .bind(sender_pseudo)
    .bind(receiver_pseudo)
    .bind(amount_cipher_ref)
    .bind(currency)
    .bind(transaction_type)
    .bind(optional_string(originator))
    .bind(optional_string(beneficiary))
    .bind(&row.status)
    .bind(risk_score)
    .bind(risk_level)
    .bind(suspicion_status)
    .bind(&triggered_rules_json)
    .bind(&recommended_action)
    .bind(&review_notes)
    .bind(reviewer_id)
    .bind(screened_at)
    .execute(&pool)
    .await
    .map_err(internal_error)?;

    sqlx::query(
        r#"
        INSERT INTO audit_logs
            (tx_id, event_type, event_status, event_ref, details, created_at)
        VALUES
            ($1, 'bank_side_risk_evaluation', $2, $3, $4, NOW())
        "#,
    )
    .bind(&tx_id)
    .bind(suspicion_status)
    .bind(reviewer_id.to_string())
    .bind(json!({
        "risk_score": risk_score,
        "risk_level": risk_level,
        "suspicion_status": suspicion_status,
        "triggered_rules": triggered_rules,
        "recommended_action": recommended_action,
        "review_notes": review_notes,
        "evaluated_by_role": claims.role,
        "bank_identifies_suspicion_before_regulator": true
    }))
    .execute(&pool)
    .await
    .map_err(internal_error)?;

    let updated_workflow = fetch_workflow(&pool, &tx_id).await?;

    Ok((
        StatusCode::OK,
        Json(json!(RiskEvaluationResponse {
            tx_id,
            risk_score,
            risk_level: risk_level.to_string(),
            suspicion_status: suspicion_status.to_string(),
            triggered_rules,
            recommended_action,
            reviewer: claims.email,
            screened_at,
            workflow: updated_workflow,
        })),
    ))
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


async fn load_rule_hit(
    pool: &PgPool,
    rule_code: &str,
    default_weight: i32,
    reason: &str,
) -> Result<Option<TriggeredRiskRule>, (StatusCode, Json<Value>)> {
    let row = sqlx::query_as::<_, AmlRuleLookupRow>(
        r#"
        SELECT rule_code, rule_name, risk_weight
        FROM aml_rules
        WHERE rule_code = $1
          AND is_active = true
        "#,
    )
    .bind(rule_code)
    .fetch_optional(pool)
    .await
    .map_err(internal_error)?;

    Ok(Some(match row {
        Some(rule) => TriggeredRiskRule {
            rule_code: rule.rule_code,
            rule_name: rule.rule_name,
            risk_weight: rule.risk_weight,
            reason: reason.to_string(),
        },
        None => TriggeredRiskRule {
            rule_code: rule_code.to_string(),
            rule_name: rule_code.replace('_', " "),
            risk_weight: default_weight,
            reason: reason.to_string(),
        },
    }))
}

fn json_string(payload: &Value, keys: &[&str]) -> Option<String> {
    keys.iter().find_map(|key| {
        payload
            .get(*key)
            .and_then(Value::as_str)
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(ToString::to_string)
    })
}

fn json_number(payload: &Value, keys: &[&str]) -> Option<f64> {
    keys.iter().find_map(|key| {
        payload.get(*key).and_then(|value| {
            value
                .as_f64()
                .or_else(|| value.as_i64().map(|number| number as f64))
                .or_else(|| value.as_u64().map(|number| number as f64))
                .or_else(|| value.as_str().and_then(|text| text.parse::<f64>().ok()))
        })
    })
}

fn contains_any(text: &str, needles: &[&str]) -> bool {
    needles.iter().any(|needle| text.contains(needle))
}

fn optional_string(value: String) -> Option<String> {
    let trimmed = value.trim().to_string();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed)
    }
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
            w.last_error,
            t.risk_score,
            t.risk_level,
            t.suspicion_status,
            t.triggered_rules,
            t.recommended_action,
            t.review_notes AS risk_review_notes,
            t.screened_by AS risk_screened_by,
            risk_screener.email AS risk_screened_by_email,
            t.screened_at AS risk_screened_at
        FROM workflow_base w
        LEFT JOIN app_users submitter ON submitter.id = w.submitted_by
        LEFT JOIN app_users reviewer ON reviewer.id = w.reviewed_by
        LEFT JOIN transactions t ON t.tx_id = w.tx_id
        LEFT JOIN app_users risk_screener ON risk_screener.id = t.screened_by
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
