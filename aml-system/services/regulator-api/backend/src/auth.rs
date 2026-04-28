use argon2::{
    password_hash::{SaltString},
    Argon2, PasswordHasher,
};
use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::post,
    Json, Router,
};
use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub full_name: String,
    pub email: String,
    pub password: String,
    pub organization_name: String,
    pub requested_role: String,
    pub reason_for_access: String,
}

#[derive(Debug, Serialize)]
pub struct RegisterResponse {
    pub user_id: String,
    pub organization_id: String,
    pub full_name: String,
    pub email: String,
    pub requested_role: String,
    pub account_status: String,
    pub message: String,
}

pub fn routes() -> Router<PgPool> {
    Router::new().route("/auth/register", post(register))
}

async fn register(
    State(pool): State<PgPool>,
    Json(input): Json<RegisterRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let full_name = input.full_name.trim();
    let email = input.email.trim().to_lowercase();
    let password = input.password.trim();
    let organization_name = input.organization_name.trim();
    let requested_role = input.requested_role.trim();
    let reason_for_access = input.reason_for_access.trim();

    validate_registration(
        full_name,
        &email,
        password,
        organization_name,
        requested_role,
        reason_for_access,
    )?;

    let existing_user = sqlx::query_scalar::<_, Uuid>(
        "SELECT id FROM app_users WHERE email = $1",
    )
    .bind(&email)
    .fetch_optional(&pool)
    .await
    .map_err(internal_error)?;

    if existing_user.is_some() {
        return Err((
            StatusCode::CONFLICT,
            Json(json!({
                "error": "email_already_registered",
                "message": "This email is already registered. Login or contact the super admin for approval status."
            })),
        ));
    }

    let password_hash = hash_password(password)?;

    let user_id = Uuid::new_v4();
    let approval_request_id = Uuid::new_v4();

    let mut tx = pool.begin().await.map_err(internal_error)?;

    let organization_id = match sqlx::query_scalar::<_, Uuid>(
        "SELECT id FROM organizations WHERE LOWER(name) = LOWER($1)",
    )
    .bind(organization_name)
    .fetch_optional(&mut *tx)
    .await
    .map_err(internal_error)?
    {
        Some(existing_id) => existing_id,
        None => {
            let new_org_id = Uuid::new_v4();

            sqlx::query(
                r#"
                INSERT INTO organizations (id, name, status, created_at)
                VALUES ($1, $2, 'active', NOW())
                "#,
            )
            .bind(new_org_id)
            .bind(organization_name)
            .execute(&mut *tx)
            .await
            .map_err(internal_error)?;

            new_org_id
        }
    };

    sqlx::query(
        r#"
        INSERT INTO app_users
            (id, organization_id, full_name, email, password_hash, role,
             account_status, reason_for_access, created_at)
        VALUES
            ($1, $2, $3, $4, $5, $6,
             'pending_approval', $7, NOW())
        "#,
    )
    .bind(user_id)
    .bind(organization_id)
    .bind(full_name)
    .bind(&email)
    .bind(password_hash)
    .bind(requested_role)
    .bind(reason_for_access)
    .execute(&mut *tx)
    .await
    .map_err(internal_error)?;

    sqlx::query(
        r#"
        INSERT INTO user_approval_requests
            (id, user_id, requested_role, reason_for_access, status, created_at)
        VALUES
            ($1, $2, $3, $4, 'pending_approval', NOW())
        "#,
    )
    .bind(approval_request_id)
    .bind(user_id)
    .bind(requested_role)
    .bind(reason_for_access)
    .execute(&mut *tx)
    .await
    .map_err(internal_error)?;

    tx.commit().await.map_err(internal_error)?;

    Ok((
        StatusCode::CREATED,
        Json(RegisterResponse {
            user_id: user_id.to_string(),
            organization_id: organization_id.to_string(),
            full_name: full_name.to_string(),
            email,
            requested_role: requested_role.to_string(),
            account_status: "pending_approval".to_string(),
            message: "Registration submitted. Your account is pending super admin approval.".to_string(),
        }),
    ))
}

fn validate_registration(
    full_name: &str,
    email: &str,
    password: &str,
    organization_name: &str,
    requested_role: &str,
    reason_for_access: &str,
) -> Result<(), (StatusCode, Json<serde_json::Value>)> {
    let mut errors = Vec::new();

    if full_name.len() < 2 {
        errors.push("full_name must be at least 2 characters");
    }

    if !email.contains('@') || email.len() < 5 {
        errors.push("email must be valid");
    }

    if password.len() < 8 {
        errors.push("password must be at least 8 characters");
    }

    if organization_name.len() < 2 {
        errors.push("organization_name must be at least 2 characters");
    }

    if reason_for_access.len() < 10 {
        errors.push("reason_for_access must be at least 10 characters");
    }

    if !is_allowed_requested_role(requested_role) {
        errors.push("requested_role is not allowed for self-registration");
    }

    if !errors.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "validation_failed",
                "message": "Registration validation failed",
                "details": errors
            })),
        ));
    }

    Ok(())
}

fn is_allowed_requested_role(role: &str) -> bool {
    matches!(
        role,
        "institution_admin"
            | "transaction_submitter"
            | "transaction_reviewer"
            | "regulator"
            | "auditor"
    )
}

fn hash_password(password: &str) -> Result<String, (StatusCode, Json<serde_json::Value>)> {
    let salt = SaltString::generate(&mut OsRng);

    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(internal_error)
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
