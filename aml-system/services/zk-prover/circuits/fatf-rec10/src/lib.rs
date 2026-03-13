pub mod circuit;

use halo2_proofs::{dev::MockProver, pasta::Fp};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rec10Claim {
    pub tx_id: String,
    pub cdd_check_executed: bool,
    pub sender_screening_performed: bool,
    pub receiver_screening_performed: bool,
}

impl Rec10Claim {
    pub fn public_value(&self) -> u64 {
        if self.cdd_check_executed
            && self.sender_screening_performed
            && self.receiver_screening_performed
        {
            1
        } else {
            0
        }
    }
}

pub fn verify_claim_with_circuit(claim: &Rec10Claim) -> Result<(), String> {
    let circuit = circuit::Rec10Circuit {
        check_executed: halo2_proofs::circuit::Value::known(Fp::from(claim.public_value())),
    };

    let public_inputs = vec![vec![Fp::from(claim.public_value())]];
    let prover = MockProver::run(8, &circuit, public_inputs)
        .map_err(|e| format!("rec10 mock prover init failed: {:?}", e))?;

    prover
        .verify()
        .map_err(|e| format!("rec10 mock prover verify failed: {:?}", e))
}

#[cfg(test)]
mod tests;