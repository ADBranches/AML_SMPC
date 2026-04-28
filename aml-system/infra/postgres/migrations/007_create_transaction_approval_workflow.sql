CREATE TABLE IF NOT EXISTS transaction_workflow_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_id VARCHAR(64) NOT NULL UNIQUE,
    payload JSONB NOT NULL,

    status VARCHAR(32) NOT NULL DEFAULT 'submitted' CHECK (
        status IN (
            'draft',
            'submitted',
            'under_review',
            'approved',
            'rejected',
            'screening_failed',
            'screened',
            'proof_failed',
            'proof_generated'
        )
    ),

    submitted_by UUID NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
    reviewed_by UUID REFERENCES app_users(id) ON DELETE SET NULL,

    review_note TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    screening_started_at TIMESTAMPTZ,
    screening_completed_at TIMESTAMPTZ,
    proof_generated_at TIMESTAMPTZ,
    last_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_transaction_workflow_status
ON transaction_workflow_requests(status);

CREATE INDEX IF NOT EXISTS idx_transaction_workflow_submitted_by
ON transaction_workflow_requests(submitted_by);

CREATE INDEX IF NOT EXISTS idx_transaction_workflow_reviewed_by
ON transaction_workflow_requests(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_transaction_workflow_submitted_at
ON transaction_workflow_requests(submitted_at);
