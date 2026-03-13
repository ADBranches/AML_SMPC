mod ffi;
mod routes;

use std::{env, net::SocketAddr};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,he_rust_gateway=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let bind_addr = env::var("HE_GATEWAY_BIND").unwrap_or_else(|_| "127.0.0.1:8082".to_string());
    let addr: SocketAddr = bind_addr.parse().expect("Invalid HE_GATEWAY_BIND");

    let app = routes::router();
    tracing::info!("he-rust-gateway listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind listener");

    axum::serve(listener, app)
        .await
        .expect("server failed");
}