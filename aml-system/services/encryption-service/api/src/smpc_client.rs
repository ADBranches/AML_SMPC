use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
struct ScreenRequest {
    tx_id: String,
    entity_id: i64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ScreenResponse {
    pub tx_id: String,
    pub entity_id: i64,
    pub screening_result: String,
}

pub async fn screen_entity(
    smpc_base_url: &str,
    tx_id: &str,
    entity_id: i64,
) -> Result<ScreenResponse, String> {
    let client = Client::new();
    let url = format!("{}/smpc/screen", smpc_base_url.trim_end_matches('/'));

    let response = client
        .post(&url)
        .json(&ScreenRequest {
            tx_id: tx_id.to_string(),
            entity_id,
        })
        .send()
        .await
        .map_err(|e| format!("failed to call SMPC runtime: {}", e))?;

    let status = response.status();

    if !status.is_success() {
        let body = response
            .text()
            .await
            .unwrap_or_else(|_| "<unreadable error body>".to_string());
        return Err(format!(
            "SMPC runtime returned non-success status {}: {}",
            status, body
        ));
    }

    response
        .json::<ScreenResponse>()
        .await
        .map_err(|e| format!("failed to decode SMPC response: {}", e))
}   