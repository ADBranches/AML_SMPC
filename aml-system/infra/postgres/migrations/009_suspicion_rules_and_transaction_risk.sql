-- 009_suspicion_rules_and_transaction_risk.sql
-- Purpose:
-- Add bank-side AML risk evaluation so suspicious transaction detection
-- starts from the partner bank/institution layer before regulator verification.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS risk_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risk_level VARCHAR(32) NOT NULL DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS suspicion_status VARCHAR(32) NOT NULL DEFAULT 'not_evaluated',
  ADD COLUMN IF NOT EXISTS triggered_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recommended_action VARCHAR(128),
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS screened_by UUID NULL REFERENCES app_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS screened_at TIMESTAMPTZ NULL;

DO $$
BEGIN
  ALTER TABLE transactions
    ADD CONSTRAINT transactions_risk_level_check
    CHECK (risk_level IN ('low', 'medium', 'high'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE transactions
    ADD CONSTRAINT transactions_suspicion_status_check
    CHECK (
      suspicion_status IN (
        'not_evaluated',
        'not_suspicious',
        'under_review',
        'suspicious'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_transactions_risk_level
ON transactions (risk_level);

CREATE INDEX IF NOT EXISTS idx_transactions_suspicion_status
ON transactions (suspicion_status);

CREATE INDEX IF NOT EXISTS idx_transactions_screened_by
ON transactions (screened_by);

CREATE TABLE IF NOT EXISTS aml_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_code VARCHAR(64) UNIQUE NOT NULL,
  rule_name VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  rule_type VARCHAR(64) NOT NULL,
  risk_weight INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aml_rules_active
ON aml_rules (is_active);

CREATE INDEX IF NOT EXISTS idx_aml_rules_rule_type
ON aml_rules (rule_type);

INSERT INTO aml_rules (
  rule_code,
  rule_name,
  description,
  rule_type,
  risk_weight,
  is_active
)
VALUES
  (
    'AMOUNT_HIGH_VALUE',
    'High Value Transaction',
    'Flags transactions whose value is high enough to require enhanced AML review.',
    'transaction_threshold',
    25,
    true
  ),
  (
    'CROSS_BORDER_TRANSFER',
    'Cross-Border Transfer',
    'Flags transactions where originator and beneficiary institutions appear to be in different jurisdictions.',
    'jurisdiction',
    15,
    true
  ),
  (
    'MISSING_PAYMENT_TRANSPARENCY',
    'Missing Payment Transparency Metadata',
    'Flags transactions missing originator, beneficiary, or travel-rule related metadata.',
    'fatf_rec16',
    30,
    true
  ),
  (
    'HIGH_RISK_COUNTERPARTY',
    'High-Risk Counterparty',
    'Flags counterparties that appear in high-risk or watchlist-like references.',
    'counterparty',
    30,
    true
  ),
  (
    'CDD_INCOMPLETE',
    'Customer Due Diligence Incomplete',
    'Flags transactions whose available metadata suggests incomplete customer due diligence.',
    'fatf_rec10',
    25,
    true
  ),
  (
    'SMPC_CROSS_BANK_OVERLAP',
    'SMPC Cross-Bank Overlap',
    'Flags privacy-preserving overlap evidence from multi-bank SMPC collaboration.',
    'smpc_collaboration',
    35,
    true
  ),
  (
    'SANCTIONS_SCREEN_ATTENTION',
    'Sanctions Screening Attention',
    'Flags transactions requiring additional screening attention.',
    'sanctions_screening',
    50,
    true
  )
ON CONFLICT (rule_code) DO UPDATE
SET
  rule_name = EXCLUDED.rule_name,
  description = EXCLUDED.description,
  rule_type = EXCLUDED.rule_type,
  risk_weight = EXCLUDED.risk_weight,
  is_active = EXCLUDED.is_active;
