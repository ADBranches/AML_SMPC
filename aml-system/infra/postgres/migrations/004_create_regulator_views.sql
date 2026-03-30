CREATE OR REPLACE VIEW v_regulator_proofs AS
SELECT
    id,
    tx_id,
    rule_id,
    claim_hash,
    public_signal,
    verification_status,
    created_at
FROM proofs;

CREATE OR REPLACE VIEW v_regulator_audit_timeline AS
SELECT
    id,
    tx_id,
    event_type,
    event_status,
    event_ref,
    details,
    created_at
FROM audit_logs;
