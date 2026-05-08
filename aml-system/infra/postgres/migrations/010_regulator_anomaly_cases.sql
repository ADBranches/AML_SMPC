-- 010_regulator_anomaly_cases.sql
-- Purpose:
-- Allow regulator users to open anomaly cases from suspicious SMPC/risk evidence
-- and notify involved partner banks without exposing raw cross-bank private data.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS anomaly_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_ref VARCHAR(64) UNIQUE NOT NULL,
  tx_id VARCHAR(64) NOT NULL,
  opened_by UUID NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  case_status VARCHAR(32) NOT NULL DEFAULT 'open',
  risk_level VARCHAR(32) NOT NULL,
  summary TEXT NOT NULL,
  regulator_finding TEXT,
  required_bank_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE anomaly_cases
    ADD CONSTRAINT anomaly_cases_status_check
    CHECK (case_status IN ('open', 'under_investigation', 'awaiting_bank_response', 'closed'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE anomaly_cases
    ADD CONSTRAINT anomaly_cases_risk_level_check
    CHECK (risk_level IN ('low', 'medium', 'high'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_anomaly_cases_tx_id
ON anomaly_cases (tx_id);

CREATE INDEX IF NOT EXISTS idx_anomaly_cases_status
ON anomaly_cases (case_status);

CREATE INDEX IF NOT EXISTS idx_anomaly_cases_risk_level
ON anomaly_cases (risk_level);

CREATE INDEX IF NOT EXISTS idx_anomaly_cases_opened_by
ON anomaly_cases (opened_by);

CREATE TABLE IF NOT EXISTS anomaly_case_banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES anomaly_cases(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  notice_status VARCHAR(32) NOT NULL DEFAULT 'sent',
  bank_response TEXT,
  responded_by UUID NULL REFERENCES app_users(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_id, organization_id)
);

DO $$
BEGIN
  ALTER TABLE anomaly_case_banks
    ADD CONSTRAINT anomaly_case_banks_notice_status_check
    CHECK (notice_status IN ('sent', 'viewed', 'responded', 'closed'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_anomaly_case_banks_case_id
ON anomaly_case_banks (case_id);

CREATE INDEX IF NOT EXISTS idx_anomaly_case_banks_organization_id
ON anomaly_case_banks (organization_id);

CREATE INDEX IF NOT EXISTS idx_anomaly_case_banks_notice_status
ON anomaly_case_banks (notice_status);
