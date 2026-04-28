from pathlib import Path
from uuid import uuid4
import os
import subprocess
import sys

database_url = os.environ.get("DATABASE_URL")

if not database_url:
    env_path = Path(".env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("DATABASE_URL="):
                database_url = line.split("=", 1)[1].strip()
                break

if not database_url:
    print("DATABASE_URL was not found in environment or .env")
    sys.exit(1)

org_id = str(uuid4())
user_id = str(uuid4())

sql = f"""
INSERT INTO organizations (id, name, status, created_at)
VALUES ('{org_id}', 'AML SMPC Platform Administration', 'active', NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO app_users
    (id, organization_id, full_name, email, password_hash, role,
     account_status, reason_for_access, approved_at, created_at)
SELECT
    '{user_id}',
    (SELECT id FROM organizations WHERE name = 'AML SMPC Platform Administration' LIMIT 1),
    'Bootstrap Super Admin',
    'super.admin@aml-smpc.local',
    'bootstrap-password-login-pending',
    'super_admin',
    'active',
    'Bootstrap account for approving first platform users.',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM app_users WHERE email = 'super.admin@aml-smpc.local'
);

SELECT full_name, email, role, account_status
FROM app_users
WHERE email = 'super.admin@aml-smpc.local';
"""

subprocess.run(["psql", database_url, "-v", "ON_ERROR_STOP=1", "-c", sql], check=True)
