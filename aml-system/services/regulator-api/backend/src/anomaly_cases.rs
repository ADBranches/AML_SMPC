use crate::auth;
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::{FromRow, PgPool};
use std::collections::HashSet;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct CreateAnomalyCaseRequest {
    pub tx_id: String,
    pub summary: String,
    pub regulator_finding: Option<String>,
    pub required_bank_action: Option<String>,
    pub notified_organization_ids: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct RespondToNoticeRequest {
    pub bank_response: String,
}

#[derive(Debug, Serialize, FromRow)]
pub struct AnomalyCaseRow {
    pub id: String,
    pub case_ref: String,
    pub tx_id: String,
    pub opened_by: String,
    pub opened_by_email: Option<String>,
    pub case_status: String,
    pub risk_level: String,
    pub summary: String,
    pub regulator_finding: Option<String>,
    pub required_bank_action: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub bank_notices: Value,
}

#[derive(Debug, Serialize, FromRow)]
pub struct BankNoticeRow {
    pub notice_id: String,
    pub case_id: String,
    pub case_ref: String,
    pub tx_id: String,
    pub case_status: String,
    pub risk_level: String,
    pub summary: String,
    pub regulator_finding: Option<String>,
    pub required_bank_action: Option<String>,
    pub notice_status: String,
    pub bank_response: Option<String>,
    pub responded_at: Option<String>,
    pub created_at: String,
    pub aggregate_evidence_summary: Value,
}

#[derive(Debug, FromRow)]
struct RiskEvidenceRow {
    risk_score: Option<i32>,
    risk_level: Option<String>,
    suspicion_status: Option<String>,
    triggered_rules: Option<Value>,
    recommended_action: Option<String>,
    originator_institution: Option<String>,
    beneficiary_institution: Option<String>,
}

pub fn routes() -> Router<PgPool> {
    Router::new()
        .route("/regulator/anomaly-cases", get(list_regulator_cases).post(open_anomaly_case))
        .route("/regulator/anomaly-cases/:case_id", get(get_regulator_case))
        .route("/regulator/anomaly-cases/:case_id/close", post(close_anomaly_case))
        .route("/institution/anomaly-notices", get(list_bank_notices))
        .route("/institution/anomaly-notices/:case_id", get(get_bank_notice))
        .route("/institution/anomaly-notices/:case_id/respond", post(respond_bank_notice))
}

async fn list_regulator_cases(
    headers: HeaderMap,
    State(pool): State<PgPool>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let claims = auth::require_permission(&headers, "cases:read")?;

    if !matches!(claims.role.as_str(), "regulator" | "auditor" | "super_admin") {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({
                "error": "insufficient_role",
                "message": "Only regulator, auditor, or super admin users can read regulator anomaly cases.",
                "current_role": claims.role
            })),
        ));
    }

    let rows = sqlx::query_as::<_, AnomalyCaseRow>(&case_select_sql(
        r#"
        SELECT *
        FROM anomaly_cases
        ORDER BY created_at DESC
        "#,
    ))
    .fetch_all(&pool)
    .await
    .map_err(internal_error)?;

    Ok((StatusCode::OK, Json(json!(rows))))
}

async fn open_anomaly_case(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Json(input): Json<CreateAnomalyCaseRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let claims = auth::require_permission(&headers, "cases:create")?;
    let opened_by = parse_user_id(&claims.sub)?;

    let tx_id = input.tx_id.trim().to_string();
    let summary = input.summary.trim().to_string();

    if tx_id.is_empty() || summary.len() < 10 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "validation_failed",
                "message": "tx_id is required and summary must be at least 10 characters."
            })),
        ));
    }

    let evidence = sqlx::query_as::<_, RiskEvidenceRow>(
        r#"
        SELECT
          risk_score,
          risk_level,
          suspicion_status,
          triggered_rules,
          recommended_action,
          originator_institution,
          beneficiary_institution
        FROM transactions
        WHERE tx_id = $1
        "#,
    )
    .bind(&tx_id)
    .fetch_optional(&pool)
    .await
    .map_err(internal_error)?
    .ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({
                "error": "risk_evidence_not_found",
                "message": "No transaction risk evidence was found for this tx_id. Run risk evaluation or SMPC screening first."
            })),
        )
    })?;

    let risk_level = evidence
        .risk_level
        .clone()
        .unwrap_or_else(|| "low".to_string());

    let case_ref = format!("CASE-{}", Uuid::new_v4().simple());

    let mut tx = pool.begin().await.map_err(internal_error)?;

    let case_id = sqlx::query_scalar::<_, Uuid>(
        r#"
        INSERT INTO anomaly_cases
            (id, case_ref, tx_id, opened_by, case_status, risk_level,
             summary, regulator_finding, required_bank_action, created_at, updated_at)
        VALUES
            (uuid_generate_v4(), $1, $2, $3, 'awaiting_bank_response', $4,
             $5, $6, $7, NOW(), NOW())
        RETURNING id
        "#,
    )
    .bind(&case_ref)
    .bind(&tx_id)
    .bind(opened_by)
    .bind(&risk_level)
    .bind(&summary)
    .bind(input.regulator_finding.as_deref().unwrap_or("Suspicious SMPC/risk evidence requires bank follow-up."))
    .bind(input.required_bank_action.as_deref().unwrap_or("Review the related transaction and respond with investigation outcome."))
    .fetch_one(&mut *tx)
    .await
    .map_err(internal_error)?;

    let mut organization_ids: HashSet<Uuid> = HashSet::new();

    if let Some(ids) = input.notified_organization_ids {
        for raw_id in ids {
            let parsed = Uuid::parse_str(raw_id.trim()).map_err(|_| {
                (
                    StatusCode::BAD_REQUEST,
                    Json(json!({
                        "error": "invalid_organization_id",
                        "message": "One of the notified_organization_ids is not a valid UUID.",
                        "organization_id": raw_id
                    })),
                )
            })?;
            organization_ids.insert(parsed);
        }
    }

    let derived_orgs = sqlx::query_scalar::<_, Uuid>(
        r#"
        SELECT id
        FROM organizations
        WHERE name = $1
           OR name = $2
           OR bank_code = $1
           OR bank_code = $2
        "#,
    )
    .bind(evidence.originator_institution.as_deref().unwrap_or(""))
    .bind(evidence.beneficiary_institution.as_deref().unwrap_or(""))
    .fetch_all(&mut *tx)
    .await
    .map_err(internal_error)?;

    for org_id in derived_orgs {
        organization_ids.insert(org_id);
    }

    if organization_ids.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "no_involved_banks_resolved",
                "message": "No partner bank organization could be resolved for this anomaly case. Provide notified_organization_ids."
            })),
        ));
    }

    for org_id in organization_ids {
        sqlx::query(
            r#"
            INSERT INTO anomaly_case_banks
                (id, case_id, organization_id, notice_status, created_at)
            VALUES
                (uuid_generate_v4(), $1, $2, 'sent', NOW())
            ON CONFLICT (case_id, organization_id) DO NOTHING
            "#,
        )
        .bind(case_id)
        .bind(org_id)
        .execute(&mut *tx)
        .await
        .map_err(internal_error)?;
    }

    sqlx::query(
        r#"
        INSERT INTO audit_logs
            (tx_id, event_type, event_status, event_ref, details, created_at)
        VALUES
            ($1, 'regulator_anomaly_case_opened', 'open', $2, $3, NOW())
        "#,
    )
    .bind(&tx_id)
    .bind(case_ref.clone())
    .bind(json!({
        "case_id": case_id,
        "case_ref": case_ref,
        "risk_score": evidence.risk_score,
        "risk_level": risk_level,
        "suspicion_status": evidence.suspicion_status,
        "triggered_rules": evidence.triggered_rules,
        "recommended_action": evidence.recommended_action,
        "raw_bank_inputs_exposed": false,
        "opened_by_regulator": claims.email
    }))
    .execute(&mut *tx)
    .await
    .map_err(internal_error)?;

    tx.commit().await.map_err(internal_error)?;

    let row = fetch_regulator_case(&pool, &case_id.to_string()).await?;

    Ok((StatusCode::CREATED, Json(json!(row))))
}

async fn get_regulator_case(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(case_id): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let claims = auth::require_permission(&headers, "cases:read")?;

    if !matches!(claims.role.as_str(), "regulator" | "auditor" | "super_admin") {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({
                "error": "insufficient_role",
                "message": "Only regulator, auditor, or super admin users can read regulator anomaly cases."
            })),
        ));
    }

    let row = fetch_regulator_case(&pool, &case_id).await?;

    Ok((StatusCode::OK, Json(json!(row))))
}

async fn close_anomaly_case(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(case_id): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let claims = auth::require_permission(&headers, "cases:update")?;

    if !matches!(claims.role.as_str(), "regulator" | "super_admin") {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({
                "error": "insufficient_role",
                "message": "Only regulator or super admin users can close anomaly cases."
            })),
        ));
    }

    sqlx::query(
        r#"
        UPDATE anomaly_cases
        SET case_status = 'closed',
            updated_at = NOW()
        WHERE id::text = $1
           OR case_ref = $1
        "#,
    )
    .bind(&case_id)
    .execute(&pool)
    .await
    .map_err(internal_error)?;

    let row = fetch_regulator_case(&pool, &case_id).await?;

    Ok((StatusCode::OK, Json(json!(row))))
}

async fn list_bank_notices(
    headers: HeaderMap,
    State(pool): State<PgPool>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let claims = auth::require_permission(&headers, "cases:read")?;

    if !matches!(claims.role.as_str(), "institution_admin" | "transaction_reviewer") {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({
                "error": "insufficient_role",
                "message": "Only bank institution users can read bank anomaly notices.",
                "current_role": claims.role
            })),
        ));
    }

    let organization_id = user_organization_id(&pool, &claims.sub).await?;

    let rows = sqlx::query_as::<_, BankNoticeRow>(&bank_notice_select_sql(
        r#"
        WHERE b.organization_id = $1
        ORDER BY b.created_at DESC
        "#,
    ))
    .bind(organization_id)
    .fetch_all(&pool)
    .await
    .map_err(internal_error)?;

    Ok((StatusCode::OK, Json(json!(rows))))
}

async fn get_bank_notice(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(case_id): Path<String>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let claims = auth::require_permission(&headers, "cases:read")?;
    let organization_id = user_organization_id(&pool, &claims.sub).await?;

    sqlx::query(
        r#"
        UPDATE anomaly_case_banks b
        SET notice_status = 'viewed'
        FROM anomaly_cases c
        WHERE b.case_id = c.id
          AND b.organization_id = $1
          AND (c.id::text = $2 OR c.case_ref = $2)
          AND b.notice_status = 'sent'
        "#,
    )
    .bind(organization_id)
    .bind(&case_id)
    .execute(&pool)
    .await
    .map_err(internal_error)?;

    let row = fetch_bank_notice(&pool, organization_id, &case_id).await?;

    Ok((StatusCode::OK, Json(json!(row))))
}

async fn respond_bank_notice(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(case_id): Path<String>,
    Json(input): Json<RespondToNoticeRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let claims = auth::require_permission(&headers, "cases:respond")?;
    let user_id = parse_user_id(&claims.sub)?;
    let organization_id = user_organization_id(&pool, &claims.sub).await?;

    if input.bank_response.trim().len() < 10 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "validation_failed",
                "message": "bank_response must be at least 10 characters."
            })),
        ));
    }

    sqlx::query(
        r#"
        UPDATE anomaly_case_banks b
        SET notice_status = 'responded',
            bank_response = $3,
            responded_by = $4,
            responded_at = NOW()
        FROM anomaly_cases c
        WHERE b.case_id = c.id
          AND b.organization_id = $1
          AND (c.id::text = $2 OR c.case_ref = $2)
        "#,
    )
    .bind(organization_id)
    .bind(&case_id)
    .bind(input.bank_response.trim())
    .bind(user_id)
    .execute(&pool)
    .await
    .map_err(internal_error)?;

    let row = fetch_bank_notice(&pool, organization_id, &case_id).await?;

    Ok((StatusCode::OK, Json(json!(row))))
}

fn case_select_sql(inner_sql: &str) -> String {
    format!(
        r#"
        WITH case_base AS (
          {}
        )
        SELECT
          c.id::text AS id,
          c.case_ref,
          c.tx_id,
          c.opened_by::text AS opened_by,
          opener.email AS opened_by_email,
          c.case_status,
          c.risk_level,
          c.summary,
          c.regulator_finding,
          c.required_bank_action,
          c.created_at::text AS created_at,
          c.updated_at::text AS updated_at,
          COALESCE(
            jsonb_agg(
              jsonb_build_object(
                'notice_id', b.id::text,
                'organization_id', o.id::text,
                'organization_name', o.name,
                'bank_code', o.bank_code,
                'organization_type', o.organization_type,
                'notice_status', b.notice_status,
                'bank_response', b.bank_response,
                'responded_at', b.responded_at::text,
                'created_at', b.created_at::text
              )
              ORDER BY o.name
            ) FILTER (WHERE b.id IS NOT NULL),
            '[]'::jsonb
          ) AS bank_notices
        FROM case_base c
        LEFT JOIN app_users opener ON opener.id = c.opened_by
        LEFT JOIN anomaly_case_banks b ON b.case_id = c.id
        LEFT JOIN organizations o ON o.id = b.organization_id
        GROUP BY
          c.id, c.case_ref, c.tx_id, c.opened_by, opener.email,
          c.case_status, c.risk_level, c.summary, c.regulator_finding,
          c.required_bank_action, c.created_at, c.updated_at
        ORDER BY c.created_at DESC
        "#,
        inner_sql
    )
}

fn bank_notice_select_sql(where_sql: &str) -> String {
    format!(
        r#"
        SELECT
          b.id::text AS notice_id,
          c.id::text AS case_id,
          c.case_ref,
          c.tx_id,
          c.case_status,
          c.risk_level,
          c.summary,
          c.regulator_finding,
          c.required_bank_action,
          b.notice_status,
          b.bank_response,
          b.responded_at::text AS responded_at,
          b.created_at::text AS created_at,
          jsonb_build_object(
            'risk_score', t.risk_score,
            'risk_level', t.risk_level,
            'suspicion_status', t.suspicion_status,
            'triggered_rules', t.triggered_rules,
            'recommended_action', t.recommended_action,
            'raw_bank_inputs_exposed', false
          ) AS aggregate_evidence_summary
        FROM anomaly_case_banks b
        JOIN anomaly_cases c ON c.id = b.case_id
        LEFT JOIN transactions t ON t.tx_id = c.tx_id
        {}
        "#,
        where_sql
    )
}

async fn fetch_regulator_case(
    pool: &PgPool,
    case_id: &str,
) -> Result<AnomalyCaseRow, (StatusCode, Json<Value>)> {
    sqlx::query_as::<_, AnomalyCaseRow>(&case_select_sql(
        r#"
        SELECT *
        FROM anomaly_cases
        WHERE id::text = $1
           OR case_ref = $1
        "#,
    ))
    .bind(case_id)
    .fetch_optional(pool)
    .await
    .map_err(internal_error)?
    .ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({
                "error": "anomaly_case_not_found",
                "message": "No anomaly case was found for this ID or reference."
            })),
        )
    })
}

async fn fetch_bank_notice(
    pool: &PgPool,
    organization_id: Uuid,
    case_id: &str,
) -> Result<BankNoticeRow, (StatusCode, Json<Value>)> {
    sqlx::query_as::<_, BankNoticeRow>(&bank_notice_select_sql(
        r#"
        WHERE b.organization_id = $1
          AND (c.id::text = $2 OR c.case_ref = $2)
        "#,
    ))
    .bind(organization_id)
    .bind(case_id)
    .fetch_optional(pool)
    .await
    .map_err(internal_error)?
    .ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({
                "error": "bank_notice_not_found",
                "message": "No anomaly notice was found for this organization and case."
            })),
        )
    })
}

async fn user_organization_id(
    pool: &PgPool,
    user_id: &str,
) -> Result<Uuid, (StatusCode, Json<Value>)> {
    let parsed = parse_user_id(user_id)?;

    sqlx::query_scalar::<_, Uuid>(
        "SELECT organization_id FROM app_users WHERE id = $1",
    )
    .bind(parsed)
    .fetch_optional(pool)
    .await
    .map_err(internal_error)?
    .ok_or_else(|| {
        (
            StatusCode::FORBIDDEN,
            Json(json!({
                "error": "organization_scope_missing",
                "message": "The logged-in user is not attached to a partner organization."
            })),
        )
    })
}

fn parse_user_id(user_id: &str) -> Result<Uuid, (StatusCode, Json<Value>)> {
    Uuid::parse_str(user_id).map_err(|err| {
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
