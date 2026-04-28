# AUTH-8 Frontend RBAC Demo Checklist

## Purpose

This checklist validates that the AML SMPC frontend behaves as a role-governed enterprise application.

## Demo Credentials

| Role | Email | Password | Expected Landing Page |
|---|---|---|---|
| super_admin | super.admin@aml-smpc.local | SuperAdmin123 | /super-admin/dashboard |
| institution_admin | demo.institution.admin@example.com | StrongPass123 | /institution/dashboard |
| transaction_submitter | demo.submitter@example.com | StrongPass123 | /institution/transactions/new |
| transaction_reviewer | demo.reviewer@example.com | StrongPass123 | /institution/reviews |
| regulator | demo.regulator@example.com | StrongPass123 | /regulator/dashboard |
| auditor | demo.auditor@example.com | StrongPass123 | /regulator/audit |

## Raw Demo Credentials

super_admin | super.admin@aml-smpc.local | SuperAdmin123
institution_admin | demo.institution.admin@example.com | StrongPass123
transaction_submitter | demo.submitter@example.com | StrongPass123
transaction_reviewer | demo.reviewer@example.com | StrongPass123
regulator | demo.regulator@example.com | StrongPass123
auditor | demo.auditor@example.com | StrongPass123

## Public Access

Logged-out users can access:

- /
- /about
- /login
- /register

Logged-out users must be redirected away from:

- /institution/dashboard
- /institution/transactions/new
- /institution/reviews
- /regulator/dashboard
- /super-admin/dashboard

## Role Checks

### super_admin

Can access:

- /super-admin/dashboard
- /super-admin/pending-users
- /super-admin/users
- /super-admin/organizations
- /super-admin/roles

### institution_admin

Can access:

- /institution/dashboard
- /institution/transactions/new
- /institution/transactions
- /institution/transactions/approved
- /institution/screening-results

### transaction_submitter

Can access:

- /institution/transactions/new
- /institution/transactions

Should not access:

- /institution/reviews
- /super-admin/dashboard
- /regulator/dashboard

### transaction_reviewer

Can access:

- /institution/reviews
- /institution/transactions
- /institution/transactions/approved
- /institution/screening-results

Should not access:

- /institution/transactions/new
- /super-admin/dashboard
- /regulator/dashboard

### regulator

Can access:

- /regulator/dashboard
- /regulator/proofs
- /regulator/audit
- /regulator/performance
- /regulator/compliance-report

Should not access:

- /super-admin/dashboard
- /institution/transactions/new

### auditor

Can access:

- /regulator/proofs
- /regulator/audit
- /regulator/compliance-report

Should not access:

- /regulator/dashboard
- /regulator/performance
- /super-admin/dashboard
- /institution/transactions/new

## Backend RBAC Evidence

Run this command from aml-system:

./scripts/ci/validate-auth8-rbac-demo.sh

Expected result: protected endpoints reject users without the required permission and allow users with the correct role permissions.
