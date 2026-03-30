use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationOutcome {
    pub proof_id: String,
    pub tx_id: String,
    pub rule_id: String,
    pub verified: bool,
    pub reason: String,
}

pub async fn verify_proof_via_zk_service(
    zk_prover_base_url: &str,
    proof_id: &str,
) -> Result<VerificationOutcome, String> {
    let client = Client::new();
    let url = format!(
        "{}/proofs/{}/verify",
        zk_prover_base_url.trim_end_matches('/'),
        proof_id
    );

    let response = client
        .post(url)
        .send()
        .await
        .map_err(|e| format!("failed to call zk prover verify endpoint: {}", e))?;

    if !response.status().is_success() {
        let body = response.text().await.unwrap_or_else(|_| "<no-body>".into());
        return Err(format!("zk prover verify returned error: {}", body));
    }

    response
        .json::<VerificationOutcome>()
        .await
        .map_err(|e| format!("failed to decode verification response: {}", e))
}