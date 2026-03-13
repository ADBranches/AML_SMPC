CREATE TABLE IF NOT EXISTS proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_id VARCHAR(64) NOT NULL,
    rule_id VARCHAR(32) NOT NULL,
    claim_hash VARCHAR(128) NOT NULL,
    proof_blob JSONB NOT NULL,
    public_signal BOOLEAN NOT NULL,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'generated',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proofs_tx_id ON proofs(tx_id);
CREATE INDEX IF NOT EXISTS idx_proofs_rule_id ON proofs(rule_id);