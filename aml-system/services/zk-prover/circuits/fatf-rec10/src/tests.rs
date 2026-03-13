use super::*;

#[test]
fn rec10_claim_passes_when_checks_exist() {
    let claim = Rec10Claim {
        tx_id: "TX-REC10-1".into(),
        cdd_check_executed: true,
        sender_screening_performed: true,
        receiver_screening_performed: true,
    };

    assert!(verify_claim_with_circuit(&claim).is_ok());
}

#[test]
fn rec10_claim_fails_when_checks_missing() {
    let claim = Rec10Claim {
        tx_id: "TX-REC10-2".into(),
        cdd_check_executed: true,
        sender_screening_performed: false,
        receiver_screening_performed: true,
    };

    assert!(verify_claim_with_circuit(&claim).is_err());
}
