CREATE TABLE IF NOT EXISTS retention_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_name VARCHAR(128) UNIQUE NOT NULL,
    target_table VARCHAR(128) NOT NULL,
    retention_days INTEGER NOT NULL,
    purge_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO retention_policies (policy_name, target_table, retention_days, purge_enabled)
VALUES
    ('audit_logs_default', 'audit_logs', 30, FALSE),
    ('proofs_default', 'proofs', 365, FALSE)
ON CONFLICT (policy_name) DO NOTHING;