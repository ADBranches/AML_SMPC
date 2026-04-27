pub mod circuit;

use halo2_proofs::{dev::MockProver, pasta::Fp};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rec11Claim {
    pub tx_id: String,
    pub transaction_exists: bool,
    pub audit_event_count: u64,
}

impl Rec11Claim {
    pub fn public_value(&self) -> u64 {
        if self.transaction_exists && self.audit_event_count >= 3 {
            1
        } else {
            0
        }
    }
}

pub fn verify_claim_with_circuit(claim: &Rec11Claim) -> Result<(), String> {
    let circuit = circuit::Rec11Circuit {
        record_integrity: halo2_proofs::circuit::Value::known(Fp::from(claim.public_value())),
    };

    let public_inputs = vec![vec![Fp::from(claim.public_value())]];
    let prover = MockProver::run(8, &circuit, public_inputs)
        .map_err(|e| format!("rec11 mock prover init failed: {:?}", e))?;

    prover
        .verify()
        .map_err(|e| format!("rec11 mock prover verify failed: {:?}", e))
}

#[cfg(test)]
mod tests;