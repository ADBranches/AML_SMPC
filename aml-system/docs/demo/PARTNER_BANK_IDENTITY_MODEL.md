# Partner Bank Identity Model

## Purpose

The AML SMPC system is not a general public signup system. It is designed for approved partner banks, regulators, auditors, and platform administrators.

## Registration Fields

Users request access with:

- full name
- email
- password
- partner bank code
- bank employee ID
- department
- job title
- requested role
- reason for access

## Approval Flow

1. User registers under a valid partner organization code.
2. Account status becomes `pending_approval`.
3. Super admin reviews the request.
4. Super admin approves, rejects, assigns role, activates, or deactivates user.
5. Approved user receives session permissions based on assigned role.

## Organization Types

Supported organization types:

- bank
- regulator
- auditor
- platform

## Role Examples

Bank roles:

- institution_admin
- transaction_submitter
- transaction_reviewer

Oversight roles:

- regulator
- auditor
- super_admin

## Security Benefit

Every user is tied to an organization scope, making RBAC and partner-bank data boundaries easier to demonstrate.
