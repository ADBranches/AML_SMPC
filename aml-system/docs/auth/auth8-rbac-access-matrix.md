# AUTH8 RBAC Frontend Access Matrix

## Purpose

This document defines which frontend routes each role should access during the AUTH8 RBAC demo.

## Role Access Rules

### transaction_submitter

Can access:

- /institution/dashboard
- /institution/transactions/new
- /institution/transactions
- /institution/screening-results

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

Run:

./scripts/ci/validate-auth8-rbac-demo.sh

Expected result: protected endpoints reject users without the required permission and allow users with the correct role permissions.
