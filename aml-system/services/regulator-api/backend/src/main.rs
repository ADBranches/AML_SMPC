mod transactions;
mod auth;
mod routes;
mod proofs;
mod audit;
mod db;

use sqlx::postgres::PgPoolOptions;
use std::{env, net::SocketAddr};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,regulator_api_backend=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let database_url =
        env::var("DATABASE_URL").expect("DATABASE_URL must be set in environment or .env");
    let bind_addr = env::var("REGULATOR_API_BIND").unwrap_or_else(|_| {
        env::var("PORT")
            .map(|port| format!("0.0.0.0:{port}"))
            .unwrap_or_else(|_| "127.0.0.1:8085".to_string())
    });

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await
        .expect("Failed to connect to PostgreSQL");

    let app = routes::router(pool);

    let addr: SocketAddr = bind_addr.parse().expect("Invalid REGULATOR_API_BIND");
    tracing::info!("regulator-api listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind listener");

    axum::serve(listener, app)
        .await
        .expect("server failed");
}
