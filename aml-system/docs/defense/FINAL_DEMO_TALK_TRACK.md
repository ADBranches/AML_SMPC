# Final Demo Talk Track

## Opening

Our project addresses a key AML challenge: financial institutions must detect suspicious activity and satisfy regulators, but conventional systems often expose too much sensitive data.

We built a privacy-preserving AML prototype that combines SMPC-style collaboration, HE-oriented architecture, zk proofs, audit logs, and RBAC.

## Architecture Explanation

The system has three main sides:

1. Bank-side users submit and review transactions.
2. The privacy-preserving computation layer performs screening.
3. The regulator verifies proof and audit evidence.

In the three-bank SMPC demo, Bank A, Bank B, and Bank C participate in privacy-preserving screening. The regulator is not a raw-data computation participant.

## User Flow

A user registers, waits for super-admin approval, logs in, and is redirected to the dashboard allowed by their role.

## Transaction Flow

A submitter creates a transaction. A reviewer approves it. Only then can screening and proof generation happen.

## Compliance Flow

The system generates proof artifacts for FATF R.10, R.11, and R.16.

The regulator verifies proof and audit evidence.

## Closing

The prototype demonstrates that AML compliance can be made more privacy-preserving while remaining auditable and regulator-verifiable.
