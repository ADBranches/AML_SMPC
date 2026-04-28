CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (
        role IN (
            'super_admin',
            'admin',
            'institution_admin',
            'transaction_submitter',
            'transaction_reviewer',
            'regulator',
            'auditor'
        )
    ),
    account_status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (
        account_status IN (
            'pending_approval',
            'active',
            'rejected',
            'disabled'
        )
    ),
    reason_for_access TEXT NOT NULL,
    approved_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_status ON app_users(account_status);
CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users(role);
CREATE INDEX IF NOT EXISTS idx_app_users_organization_id ON app_users(organization_id);

CREATE TABLE IF NOT EXISTS user_approval_requests (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    requested_role TEXT NOT NULL,
    reason_for_access TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (
        status IN (
            'pending_approval',
            'approved',
            'rejected'
        )
    ),
    reviewed_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_approval_requests_status
ON user_approval_requests(status);

CREATE INDEX IF NOT EXISTS idx_user_approval_requests_user_id
ON user_approval_requests(user_id);
