use super::*;

#[test]
fn rec16_claim_passes_when_metadata_exists() {
    let claim = Rec16Claim {
        tx_id: "TX-REC16-1".into(),
        originator_institution_present: true,
        beneficiary_institution_present: true,
        payment_metadata_present: true,
    };

    assert_eq!(claim.public_value(), 1);
    assert!(verify_claim_with_circuit(&claim).is_ok());
}

#[test]
fn rec16_claim_also_passes_when_metadata_missing_but_public_value_is_0() {
    let claim = Rec16Claim {
        tx_id: "TX-REC16-2".into(),
        originator_institution_present: true,
        beneficiary_institution_present: false,
        payment_metadata_present: true,
    };

    assert_eq!(claim.public_value(), 0);
    assert!(verify_claim_with_circuit(&claim).is_ok());
}