#!/usr/bin/env python3
"""
Seed AML SMPC partner-bank RBAC, suspicious transaction, SMPC, and anomaly-case demo data.

Run from aml-system:

    python3 scripts/dev/seed_bank_rbac_case_demo.py

Requires regulator API running on http://127.0.0.1:8085.
"""

from __future__ import annotations

import json
import subprocess
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any

API_BASE = "http://127.0.0.1:8085"
PASSWORD = "StrongPass123"
SUPER_EMAIL = "super.admin@aml-smpc.local"
SUPER_PASSWORD = "SuperAdmin123"

@dataclass
class DemoUser:
    full_name: str
    email: str
    partner_bank_code: str
    bank_employee_id: str
    department: str
    job_title: str
    requested_role: str
    reason_for_access: str

DEMO_USERS = [
    DemoUser("Bank A Admin", "bank.a.admin@example.com", "BANK_A_UG", "BANKA-ADMIN-001", "Compliance", "Institution AML Administrator", "institution_admin", "Administers AML SMPC workflows for Bank A."),
    DemoUser("Bank A Submitter", "bank.a.submitter@example.com", "BANK_A_UG", "BANKA-SUB-001", "Operations", "Transaction Submitter", "transaction_submitter", "Submits AML transaction payloads for Bank A."),
    DemoUser("Bank A Reviewer", "bank.a.reviewer@example.com", "BANK_A_UG", "BANKA-REV-001", "Compliance", "AML Transaction Reviewer", "transaction_reviewer", "Reviews AML risk and SMPC screening outputs for Bank A."),
    DemoUser("Bank B Reviewer", "bank.b.reviewer@example.com", "BANK_B_KE", "BANKB-REV-001", "Compliance", "AML Transaction Reviewer", "transaction_reviewer", "Reviews AML risk and SMPC screening outputs for Bank B."),
    DemoUser("Bank C Reviewer", "bank.c.reviewer@example.com", "BANK_C_TZ", "BANKC-REV-001", "Compliance", "AML Transaction Reviewer", "transaction_reviewer", "Reviews AML risk and SMPC screening outputs for Bank C."),
]

def request(method: str, path: str, payload: dict[str, Any] | None = None, token: str | None = None) -> tuple[int, Any]:
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{API_BASE}{path}", data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            body = response.read().decode("utf-8")
            return response.status, json.loads(body) if body else None
    except urllib.error.HTTPError as err:
        body = err.read().decode("utf-8")
        try:
            return err.code, json.loads(body)
        except json.JSONDecodeError:
            return err.code, body

def login(email: str, password: str) -> tuple[str, dict[str, Any]]:
    status, payload = request("POST", "/auth/login", {"email": email, "password": password})
    if status != 200:
        raise RuntimeError(f"Login failed for {email}: {status} {payload}")
    return payload["token"], payload

def database_url() -> str:
    for line in Path(".env").read_text().splitlines():
        if line.startswith("DATABASE_URL="):
            return line.split("=", 1)[1]
    raise RuntimeError("DATABASE_URL not found in .env")

def psql(sql: str) -> str:
    result = subprocess.run(["psql", database_url(), "-Atc", sql], check=True, text=True, capture_output=True)
    return result.stdout.strip()

def apply_migration(path: str) -> None:
    file_path = Path(path)
    if file_path.exists():
        subprocess.run(["psql", database_url(), "-v", "ON_ERROR_STOP=1", "-f", str(file_path)], check=True)

def register_and_approve_users(super_token: str) -> None:
    for user in DEMO_USERS:
        status, payload = request("POST", "/auth/register", {
            "full_name": user.full_name,
            "email": user.email,
            "password": PASSWORD,
            "partner_bank_code": user.partner_bank_code,
            "bank_employee_id": user.bank_employee_id,
            "department": user.department,
            "job_title": user.job_title,
            "requested_role": user.requested_role,
            "reason_for_access": user.reason_for_access,
        })
        if status in (200, 201):
            print(f"✅ Registered {user.email}")
        elif status == 409:
            print(f"ℹ️  User already exists: {user.email}")
        else:
            print(f"⚠️  Registration issue for {user.email}: {status} {payload}")

    status, pending = request("GET", "/admin/users/pending", token=super_token)
    if status != 200:
        print(f"⚠️ Could not list pending users: {status} {pending}")
        return
    target_roles = {user.email: user.requested_role for user in DEMO_USERS}
    for row in pending:
        email = row.get("email")
        if email not in target_roles:
            continue
        status, payload = request("POST", f"/admin/users/{row['user_id']}/approve", {"assigned_role": target_roles[email]}, token=super_token)
        if status in (200, 201):
            print(f"✅ Approved {email} as {target_roles[email]}")
        else:
            print(f"⚠️ Approval issue for {email}: {status} {payload}")

def create_transaction(token: str, tx_id: str, amount: int, overlap: int, screening_indicator: str) -> None:
    payload = {
        "tx_id": tx_id,
        "sender_id": f"SENDER-{tx_id}",
        "receiver_id": f"RECEIVER-{tx_id}",
        "sender_entity_id": 1001,
        "receiver_entity_id": 2002,
        "sender_pseudo": "bank_a_customer_hash_001",
        "receiver_pseudo": "shared_counterparty_hash_777",
        "amount": amount,
        "amount_cipher_ref": f"cipher_amount_{amount}_demo",
        "currency": "USD",
        "transaction_type": "cross_border_wire_transfer",
        "originator_name": "Demo Originator Customer",
        "beneficiary_name": "Demo Beneficiary Customer",
        "originator_institution": "Bank A Uganda",
        "beneficiary_institution": "Bank B Kenya",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "possible_cross_bank_overlap_count": overlap,
        "screening_indicator": screening_indicator,
        "counterparty_risk": "high_risk_counterparty" if amount >= 100000 else "normal",
        "cdd_status": "cdd_incomplete" if amount >= 100000 else "complete",
    }
    status, body = request("POST", "/transactions", payload, token=token)
    if status in (200, 201):
        print(f"✅ Created transaction {tx_id}")
    elif status == 409:
        print(f"ℹ️  Transaction already exists: {tx_id}")
    else:
        print(f"⚠️ Transaction create issue for {tx_id}: {status} {body}")

def approve_and_screen(reviewer_token: str, tx_id: str) -> None:
    request("POST", f"/transactions/{tx_id}/approve", {"note": "Demo reviewer approval for seeded workflow."}, token=reviewer_token)
    status, body = request("POST", f"/transactions/{tx_id}/run-screening", token=reviewer_token)
    if status in (200, 201):
        print(f"✅ SMPC screening linked risk for {tx_id}")
    else:
        print(f"ℹ️ Screening skipped/issue for {tx_id}: {status} {body}")

def open_demo_case(regulator_token: str, reviewer_org_id: str) -> None:
    status, body = request("POST", "/regulator/anomaly-cases", {
        "tx_id": "TX-SMPC-OVERLAP-001",
        "summary": "Seeded SMPC overlap case for final presentation.",
        "regulator_finding": "Aggregate evidence shows cross-bank overlap and screening attention without exposing raw bank inputs.",
        "required_bank_action": "Review the transaction, confirm internal investigation status, and respond to the regulator notice.",
        "notified_organization_ids": [reviewer_org_id],
    }, token=regulator_token)
    if status in (200, 201):
        print(f"✅ Opened demo anomaly case: {body.get('case_ref')}")
    else:
        print(f"ℹ️ Case open skipped/issue: {status} {body}")

def main() -> None:
    print("=== AML SMPC Demo Seeder ===")
    apply_migration("infra/postgres/migrations/008_partner_bank_identity_and_permissions.sql")
    apply_migration("infra/postgres/migrations/009_suspicion_rules_and_transaction_risk.sql")
    apply_migration("infra/postgres/migrations/010_regulator_anomaly_cases.sql")
    print("✅ Partner organizations, AML rules, and anomaly tables confirmed.")

    super_token, _ = login(SUPER_EMAIL, SUPER_PASSWORD)
    register_and_approve_users(super_token)

    submitter_token, _ = login("demo.submitter@example.com", PASSWORD)
    reviewer_token, reviewer_session = login("demo.reviewer@example.com", PASSWORD)
    regulator_token, _ = login("demo.regulator@example.com", PASSWORD)

    create_transaction(submitter_token, "TX-BANKA-LOW-001", 1200, 0, "clear")
    create_transaction(submitter_token, "TX-BANKA-SUSPICIOUS-001", 250000, 0, "watchlist_attention")
    create_transaction(submitter_token, "TX-SMPC-OVERLAP-001", 250000, 1, "watchlist_attention")

    approve_and_screen(reviewer_token, "TX-BANKA-SUSPICIOUS-001")
    approve_and_screen(reviewer_token, "TX-SMPC-OVERLAP-001")

    reviewer_org_id = reviewer_session.get("organization_id") or psql("SELECT organization_id FROM app_users WHERE email='demo.reviewer@example.com' LIMIT 1;")
    if reviewer_org_id:
        open_demo_case(regulator_token, reviewer_org_id)

    print("=== Seeder complete ===")

if __name__ == "__main__":
    main()
