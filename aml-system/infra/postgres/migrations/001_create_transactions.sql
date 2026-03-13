CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_id VARCHAR(64) UNIQUE NOT NULL,
    sender_pseudo VARCHAR(128) NOT NULL,
    receiver_pseudo VARCHAR(128) NOT NULL,
    amount_cipher_ref VARCHAR(128),
    currency VARCHAR(16) NOT NULL,
    transaction_type VARCHAR(64) NOT NULL,
    originator_institution VARCHAR(128),
    beneficiary_institution VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
