CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    event_status VARCHAR(32) NOT NULL,
    event_ref VARCHAR(128),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
