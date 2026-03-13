use axum::{
    extract::State,
    routing::post,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::{collections::HashSet, net::SocketAddr, sync::Arc};

#[derive(Clone)]
struct AppState {
    sanctioned_entities: Arc<HashSet<u64>>,
}

#[derive(Deserialize)]
struct ScreenRequest {
    tx_id: String,
    entity_id: u64,
}

#[derive(Serialize)]
struct ScreenResponse {
    tx_id: String,
    entity_id: u64,
    screening_result: String,
}

async fn screen_handler(
    State(state): State<AppState>,
    Json(payload): Json<ScreenRequest>,
) -> Json<ScreenResponse> {
    let result = if state.sanctioned_entities.contains(&payload.entity_id) {
        "match"
    } else {
        "no_match"
    };

    Json(ScreenResponse {
        tx_id: payload.tx_id,
        entity_id: payload.entity_id,
        screening_result: result.to_string(),
    })
}

#[tokio::main]
async fn main() {
    let mut sanctioned = HashSet::new();
    sanctioned.insert(1007);

    let state = AppState {
        sanctioned_entities: Arc::new(sanctioned),
    };

    let app = Router::new()
        .route("/smpc/screen", post(screen_handler))
        .with_state(state);

    let addr: SocketAddr = "127.0.0.1:8083"
        .parse()
        .expect("invalid bind address 127.0.0.1:8083");

    println!("SMPC runtime listening on http://{}", addr);

    let listener = match tokio::net::TcpListener::bind(addr).await {
        Ok(listener) => listener,
        Err(err) => {
            eprintln!("Failed to bind SMPC runtime on {}: {}", addr, err);
            std::process::exit(1);
        }
    };

    if let Err(err) = axum::serve(listener, app).await {
        eprintln!("SMPC runtime server failed: {}", err);
        std::process::exit(1);
    }
}
