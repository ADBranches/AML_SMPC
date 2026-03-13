use super::*;

#[test]
fn rec16_claim_passes_when_metadata_exists() {
    let claim = Rec16Claim {
        tx_id: "TX-REC16-1".into(),
        originator_institution_present: true,
        beneficiary_institution_present: true,
        payment_metadata_present: true,
    };

    assert!(verify_claim_with_circuit(&claim).is_ok());
}

#[test]
fn rec16_claim_fails_when_metadata_missing() {
    let claim = Rec16Claim {
        tx_id: "TX-REC16-2".into(),
        originator_institution_present: true,
        beneficiary_institution_present: false,
        payment_metadata_present: true,
    };

    assert!(verify_claim_with_circuit(&claim).is_err());
}