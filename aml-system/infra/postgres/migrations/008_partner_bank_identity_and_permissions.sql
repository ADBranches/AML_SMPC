-- 008_partner_bank_identity_and_permissions.sql
-- Purpose:
-- Make the AML SMPC platform explicitly partner-bank based.
-- Users must belong to a known partner bank, regulator authority,
-- auditor body, or platform organization.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS bank_code VARCHAR(32),
  ADD COLUMN IF NOT EXISTS organization_type VARCHAR(32),
  ADD COLUMN IF NOT EXISTS country VARCHAR(64),
  ADD COLUMN IF NOT EXISTS license_number VARCHAR(64),
  ADD COLUMN IF NOT EXISTS is_partner BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'active';

ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS bank_employee_id VARCHAR(64),
  ADD COLUMN IF NOT EXISTS department VARCHAR(64),
  ADD COLUMN IF NOT EXISTS job_title VARCHAR(128),
  ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_partner_scope BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  ALTER TABLE organizations
    ADD CONSTRAINT organizations_type_check
    CHECK (
      organization_type IS NULL
      OR organization_type IN ('bank', 'regulator', 'auditor', 'platform')
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE organizations
    ADD CONSTRAINT organizations_status_check
    CHECK (status IN ('active', 'inactive', 'suspended'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_bank_code_unique
ON organizations (UPPER(bank_code))
WHERE bank_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_type
ON organizations (organization_type);

CREATE INDEX IF NOT EXISTS idx_organizations_partner_status
ON organizations (is_partner, status);

CREATE INDEX IF NOT EXISTS idx_app_users_bank_employee_id
ON app_users (bank_employee_id);

CREATE INDEX IF NOT EXISTS idx_app_users_identity_scope
ON app_users (identity_verified, approved_partner_scope);

-- Preserve old organizations by giving them safe defaults.
UPDATE organizations
SET
  organization_type = COALESCE(organization_type, 'bank'),
  is_partner = true,
  bank_code = COALESCE(
    bank_code,
    UPPER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(name, '[^A-Za-z0-9]+', '_', 'g'),
        '^_|_$',
        '',
        'g'
      )
    )
  )
WHERE bank_code IS NULL
   OR organization_type IS NULL
   OR is_partner = false;

-- Seed partner banks and oversight bodies for demo and defense.
INSERT INTO organizations (
  id,
  name,
  status,
  bank_code,
  organization_type,
  country,
  license_number,
  is_partner,
  created_at
)
VALUES
  (uuid_generate_v4(), 'Bank A Uganda', 'active', 'BANK_A_UG', 'bank', 'Uganda', 'UG-BANK-A-DEMO', true, NOW()),
  (uuid_generate_v4(), 'Bank B Kenya', 'active', 'BANK_B_KE', 'bank', 'Kenya', 'KE-BANK-B-DEMO', true, NOW()),
  (uuid_generate_v4(), 'Bank C Tanzania', 'active', 'BANK_C_TZ', 'bank', 'Tanzania', 'TZ-BANK-C-DEMO', true, NOW()),
  (uuid_generate_v4(), 'Demo Origin Bank', 'active', 'DEMO_ORIGIN_BANK', 'bank', 'Uganda', 'UG-DEMO-ORIGIN', true, NOW()),
  (uuid_generate_v4(), 'Demo Beneficiary Bank', 'active', 'DEMO_BENEFICIARY_BANK', 'bank', 'Kenya', 'KE-DEMO-BENEFICIARY', true, NOW()),
  (uuid_generate_v4(), 'Demo Regulator Authority', 'active', 'REGULATOR_AUTHORITY', 'regulator', 'Uganda', 'UG-REGULATOR-DEMO', true, NOW()),
  (uuid_generate_v4(), 'Demo Auditor Body', 'active', 'AUDITOR_BODY', 'auditor', 'Uganda', 'UG-AUDITOR-DEMO', true, NOW()),
  (uuid_generate_v4(), 'AML SMPC Platform Administration', 'active', 'AML_PLATFORM', 'platform', 'Uganda', 'PLATFORM-DEMO', true, NOW())
ON CONFLICT (name) DO UPDATE
SET
  status = EXCLUDED.status,
  bank_code = EXCLUDED.bank_code,
  organization_type = EXCLUDED.organization_type,
  country = EXCLUDED.country,
  license_number = EXCLUDED.license_number,
  is_partner = EXCLUDED.is_partner;

-- Mark already-approved users as verified within their current organization scope.
UPDATE app_users
SET
  identity_verified = true,
  approved_partner_scope = true
WHERE account_status = 'active';
