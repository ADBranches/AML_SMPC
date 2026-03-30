use super::*;

#[test]
fn rec11_claim_passes_when_records_exist() {
    let claim = Rec11Claim {
        tx_id: "TX-REC11-1".into(),
        transaction_exists: true,
        audit_event_count: 3,
    };

    assert_eq!(claim.public_value(), 1);
    assert!(verify_claim_with_circuit(&claim).is_ok());
}

#[test]
fn rec11_claim_also_passes_when_audit_is_insufficient_but_public_value_is_0() {
    let claim = Rec11Claim {
        tx_id: "TX-REC11-2".into(),
        transaction_exists: true,
        audit_event_count: 1,
    };

    assert_eq!(claim.public_value(), 0);
    assert!(verify_claim_with_circuit(&claim).is_ok());
}