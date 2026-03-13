pub mod circuit;

use halo2_proofs::{dev::MockProver, pasta::Fp};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rec16Claim {
    pub tx_id: String,
    pub originator_institution_present: bool,
    pub beneficiary_institution_present: bool,
    pub payment_metadata_present: bool,
}

impl Rec16Claim {
    pub fn public_value(&self) -> u64 {
        if self.originator_institution_present
            && self.beneficiary_institution_present
            && self.payment_metadata_present
        {
            1
        } else {
            0
        }
    }
}

pub fn verify_claim_with_circuit(claim: &Rec16Claim) -> Result<(), String> {
    let circuit = circuit::Rec16Circuit {
        metadata_present: halo2_proofs::circuit::Value::known(Fp::from(claim.public_value())),
    };

    let public_inputs = vec![vec![Fp::from(claim.public_value())]];
    let prover = MockProver::run(8, &circuit, public_inputs)
        .map_err(|e| format!("rec16 mock prover init failed: {:?}", e))?;

    prover
        .verify()
        .map_err(|e| format!("rec16 mock prover verify failed: {:?}", e))
}

#[cfg(test)]
mod tests;