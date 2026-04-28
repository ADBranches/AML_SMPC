use argon2::{
    password_hash::SaltString,
    Argon2, PasswordHasher,
};
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use rand_core::OsRng;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::{FromRow, PgPool};
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

#[derive(Debug, Deserialize)]
pub struct ApproveUserRequest {
    pub assigned_role: String,
}

#[derive(Debug, Deserialize)]
pub struct RejectUserRequest {
    pub reason: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ActivateUserRequest {
    pub assigned_role: Option<String>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct AdminUserRow {
    pub user_id: String,
    pub organization_id: Option<String>,
    pub organization_name: Option<String>,
    pub full_name: String,
    pub email: String,
    pub role: String,
    pub account_status: String,
    pub requested_role: Option<String>,
    pub approval_status: Option<String>,
    pub reason_for_access: String,
    pub created_at: String,
}

pub fn routes() -> Router<PgPool> {
    Router::new()
        .route("/auth/register", post(register))
        .route("/admin/users", get(list_users))
        .route("/admin/users/pending", get(list_pending_users))
        .route("/admin/users/:user_id/approve", post(approve_user))
        .route("/admin/users/:user_id/reject", post(reject_user))
        .route("/admin/users/:user_id/activate", post(activate_user))
        .route("/admin/users/:user_id/deactivate", post(deactivate_user))
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

async fn list_pending_users(
    State(pool): State<PgPool>,
    headers: HeaderMap,
) -> Result<Json<Vec<AdminUserRow>>, (StatusCode, Json<serde_json::Value>)> {
    require_super_admin(&pool, &headers).await?;

    let users = sqlx::query_as::<_, AdminUserRow>(
        r#"
        SELECT
            u.id::text AS user_id,
            u.organization_id::text AS organization_id,
            o.name AS organization_name,
            u.full_name,
            u.email,
            u.role,
            u.account_status,
            ar.requested_role,
            ar.status AS approval_status,
            u.reason_for_access,
            u.created_at::text AS created_at
        FROM app_users u
        LEFT JOIN organizations o ON o.id = u.organization_id
        LEFT JOIN user_approval_requests ar ON ar.user_id = u.id
        WHERE u.account_status = 'pending_approval'
           OR ar.status = 'pending_approval'
        ORDER BY u.created_at DESC
        "#,
    )
    .fetch_all(&pool)
    .await
    .map_err(internal_error)?;

    Ok(Json(users))
}

async fn list_users(
    State(pool): State<PgPool>,
    headers: HeaderMap,
) -> Result<Json<Vec<AdminUserRow>>, (StatusCode, Json<serde_json::Value>)> {
    require_super_admin(&pool, &headers).await?;

    let users = sqlx::query_as::<_, AdminUserRow>(
        r#"
        SELECT
            u.id::text AS user_id,
            u.organization_id::text AS organization_id,
            o.name AS organization_name,
            u.full_name,
            u.email,
            u.role,
            u.account_status,
            ar.requested_role,
            ar.status AS approval_status,
            u.reason_for_access,
            u.created_at::text AS created_at
        FROM app_users u
        LEFT JOIN organizations o ON o.id = u.organization_id
        LEFT JOIN user_approval_requests ar ON ar.user_id = u.id
        ORDER BY u.created_at DESC
        "#,
    )
    .fetch_all(&pool)
    .await
    .map_err(internal_error)?;

    Ok(Json(users))
}

async fn approve_user(
    State(pool): State<PgPool>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
    Json(input): Json<ApproveUserRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let admin_id = require_super_admin(&pool, &headers).await?;
    let assigned_role = input.assigned_role.trim();

    if !is_allowed_requested_role(assigned_role) && assigned_role != "admin" {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "invalid_role",
                "message": "Assigned role is not allowed."
            })),
        ));
    }

    let mut tx = pool.begin().await.map_err(internal_error)?;

    let updated = sqlx::query(
        r#"
        UPDATE app_users
        SET role = $1,
            account_status = 'active',
            approved_by = $2,
            approved_at = NOW(),
            rejected_at = NULL
        WHERE id = $3
          AND account_status IN ('pending_approval', 'rejected', 'disabled')
        "#,
    )
    .bind(assigned_role)
    .bind(admin_id)
    .bind(user_id)
    .execute(&mut *tx)
    .await
    .map_err(internal_error)?;

    if updated.rows_affected() == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({
                "error": "user_not_found_or_not_approvable",
                "message": "User was not found or is already active."
            })),
        ));
    }

    sqlx::query(
        r#"
        UPDATE user_approval_requests
        SET requested_role = $1,
            status = 'approved',
            reviewed_by = $2,
            reviewed_at = NOW()
        WHERE user_id = $3
          AND status = 'pending_approval'
        "#,
    )
    .bind(assigned_role)
    .bind(admin_id)
    .bind(user_id)
    .execute(&mut *tx)
    .await
    .map_err(internal_error)?;

    tx.commit().await.map_err(internal_error)?;

    Ok(Json(json!({
        "user_id": user_id,
        "assigned_role": assigned_role,
        "account_status": "active",
        "message": "User approved and activated successfully."
    })))
}

async fn reject_user(
    State(pool): State<PgPool>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
    Json(input): Json<RejectUserRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let admin_id = require_super_admin(&pool, &headers).await?;

    let reason = input.reason.unwrap_or_else(|| "Rejected by super admin.".to_string());

    let mut tx = pool.begin().await.map_err(internal_error)?;

    let updated = sqlx::query(
        r#"
        UPDATE app_users
        SET account_status = 'rejected',
            rejected_at = NOW()
        WHERE id = $1
          AND account_status = 'pending_approval'
        "#,
    )
    .bind(user_id)
    .execute(&mut *tx)
    .await
    .map_err(internal_error)?;

    if updated.rows_affected() == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({
                "error": "user_not_found_or_not_pending",
                "message": "User was not found or is not pending approval."
            })),
        ));
    }

    sqlx::query(
        r#"
        UPDATE user_approval_requests
        SET status = 'rejected',
            reviewed_by = $1,
            reviewed_at = NOW()
        WHERE user_id = $2
          AND status = 'pending_approval'
        "#,
    )
    .bind(admin_id)
    .bind(user_id)
    .execute(&mut *tx)
    .await
    .map_err(internal_error)?;

    tx.commit().await.map_err(internal_error)?;

    Ok(Json(json!({
        "user_id": user_id,
        "account_status": "rejected",
        "reason": reason,
        "message": "User registration rejected."
    })))
}

async fn activate_user(
    State(pool): State<PgPool>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
    Json(input): Json<ActivateUserRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    require_super_admin(&pool, &headers).await?;

    let assigned_role = input.assigned_role.unwrap_or_else(|| "auditor".to_string());

    if !is_allowed_requested_role(&assigned_role) && assigned_role != "admin" {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "invalid_role",
                "message": "Assigned role is not allowed."
            })),
        ));
    }

    let updated = sqlx::query(
        r#"
        UPDATE app_users
        SET role = $1,
            account_status = 'active'
        WHERE id = $2
        "#,
    )
    .bind(&assigned_role)
    .bind(user_id)
    .execute(&pool)
    .await
    .map_err(internal_error)?;

    if updated.rows_affected() == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({
                "error": "user_not_found",
                "message": "User was not found."
            })),
        ));
    }

    Ok(Json(json!({
        "user_id": user_id,
        "assigned_role": assigned_role,
        "account_status": "active",
        "message": "User activated successfully."
    })))
}

async fn deactivate_user(
    State(pool): State<PgPool>,
    headers: HeaderMap,
    Path(user_id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    require_super_admin(&pool, &headers).await?;

    let updated = sqlx::query(
        r#"
        UPDATE app_users
        SET account_status = 'disabled'
        WHERE id = $1
          AND role <> 'super_admin'
        "#,
    )
    .bind(user_id)
    .execute(&pool)
    .await
    .map_err(internal_error)?;

    if updated.rows_affected() == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({
                "error": "user_not_found_or_protected",
                "message": "User was not found or is protected from deactivation."
            })),
        ));
    }

    Ok(Json(json!({
        "user_id": user_id,
        "account_status": "disabled",
        "message": "User deactivated successfully."
    })))
}

async fn require_super_admin(
    pool: &PgPool,
    headers: &HeaderMap,
) -> Result<Uuid, (StatusCode, Json<serde_json::Value>)> {
    let email = headers
        .get("x-acting-user-email")
        .and_then(|value| value.to_str().ok())
        .unwrap_or("")
        .trim()
        .to_lowercase();

    if email.is_empty() {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "error": "missing_super_admin_identity",
                "message": "Missing X-Acting-User-Email header. JWT identity will replace this in the next auth phase."
            })),
        ));
    }

    let admin_id = sqlx::query_scalar::<_, Uuid>(
        r#"
        SELECT id
        FROM app_users
        WHERE LOWER(email) = LOWER($1)
          AND role = 'super_admin'
          AND account_status = 'active'
        "#,
    )
    .bind(email)
    .fetch_optional(pool)
    .await
    .map_err(internal_error)?;

    match admin_id {
        Some(id) => Ok(id),
        None => Err((
            StatusCode::FORBIDDEN,
            Json(json!({
                "error": "super_admin_required",
                "message": "Only an active super_admin can perform this action."
            })),
        )),
    }
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
