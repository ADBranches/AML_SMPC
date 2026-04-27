#[path = "../../circuits/fatf-rec10/src/lib.rs"]
mod fatf_rec10;
#[path = "../../circuits/fatf-rec11/src/lib.rs"]
mod fatf_rec11;
#[path = "../../circuits/fatf-rec16/src/lib.rs"]
mod fatf_rec16;

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProofArtifactRecord {
    pub id: String,
    pub tx_id: String,
    pub rule_id: String,
    pub claim_hash: String,
    pub proof_blob: serde_json::Value,
    pub public_signal: bool,
    pub verification_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationOutcome {
    pub proof_id: String,
    pub tx_id: String,
    pub rule_id: String,
    pub verified: bool,
    pub reason: String,
}

fn hash_json(value: &serde_json::Value) -> Result<String, String> {
    let canonical = serde_json::to_vec(value).map_err(|e| e.to_string())?;
    let mut hasher = Sha256::new();
    hasher.update(&canonical);
    Ok(hex::encode(hasher.finalize()))
}

pub fn verify_proof_artifact(
    record: &ProofArtifactRecord,
) -> Result<VerificationOutcome, String> {
    let recomputed_hash = hash_json(&record.proof_blob)?;
    if recomputed_hash != record.claim_hash {
        return Ok(VerificationOutcome {
            proof_id: record.id.clone(),
            tx_id: record.tx_id.clone(),
            rule_id: record.rule_id.clone(),
            verified: false,
            reason: "claim hash mismatch".into(),
        });
    }

    let verified = match record.rule_id.as_str() {
        "FATF_REC10" => {
            let claim: fatf_rec10::Rec10Claim =
                serde_json::from_value(record.proof_blob.clone()).map_err(|e| e.to_string())?;
            fatf_rec10::verify_claim_with_circuit(&claim).is_ok()
        }
        "FATF_REC11" => {
            let claim: fatf_rec11::Rec11Claim =
                serde_json::from_value(record.proof_blob.clone()).map_err(|e| e.to_string())?;
            fatf_rec11::verify_claim_with_circuit(&claim).is_ok()
        }
        "FATF_REC16" => {
            let claim: fatf_rec16::Rec16Claim =
                serde_json::from_value(record.proof_blob.clone()).map_err(|e| e.to_string())?;
            fatf_rec16::verify_claim_with_circuit(&claim).is_ok()
        }
        other => {
            return Ok(VerificationOutcome {
                proof_id: record.id.clone(),
                tx_id: record.tx_id.clone(),
                rule_id: record.rule_id.clone(),
                verified: false,
                reason: format!("unknown rule_id: {}", other),
            });
        }
    };

    Ok(VerificationOutcome {
        proof_id: record.id.clone(),
        tx_id: record.tx_id.clone(),
        rule_id: record.rule_id.clone(),
        verified,
        reason: if verified {
            "verification passed".into()
        } else {
            "circuit verification failed".into()
        },
    })
}