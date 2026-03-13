use wasm_bindgen::prelude::*;
use zk_verifier::{verify_proof_artifact, ProofArtifactRecord};

#[wasm_bindgen]
pub fn verify_proof_artifact_json(record_json: &str) -> Result<bool, JsValue> {
    let record: ProofArtifactRecord =
        serde_json::from_str(record_json).map_err(|e| JsValue::from_str(&e.to_string()))?;

    let outcome =
        verify_proof_artifact(&record).map_err(|e| JsValue::from_str(&e.to_string()))?;

    Ok(outcome.verified)
}