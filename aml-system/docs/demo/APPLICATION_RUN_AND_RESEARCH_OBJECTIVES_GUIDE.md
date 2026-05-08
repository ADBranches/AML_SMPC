# Application Run and Research Objectives Guide

## Research Objective

The project demonstrates privacy-preserving anti-money laundering collaboration using SMPC-style multi-bank evidence sharing, cryptographic proof generation, auditability, and regulator verification.

## Application Objective

The application supports:

- partner-bank identity
- RBAC authorization
- bank-side transaction submission
- bank-side suspicion detection
- SMPC-linked risk evidence
- proof generation
- regulator evidence verification
- anomaly case feedback
- bank notice response
- auditor read-only oversight

## Privacy Objective

The regulator receives evidence, proofs, risk summaries, and anomaly case data, but not raw bank customer data from other institutions.

## Run Commands

### Backend

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system
source env/bin/activate
./scripts/demo/run-frontend-backend.sh
```

Keep this backend terminal open while presenting or testing the frontend.

### Frontend

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/regulator-api/frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Open the application in the browser:

```text
http://127.0.0.1:5173
```

## Demo Accounts

### Regulator

```text
Email: demo.regulator@example.com
Password: StrongPass123
```

Use this account to verify proof evidence, audit evidence, three-bank SMPC evidence, and anomaly cases.

### Bank Reviewer

```text
Email: demo.reviewer@example.com
Password: StrongPass123
```

Use this account to approve transactions, run bank-side screening, review anomaly notices, and respond to regulator feedback.

### Bank Submitter

```text
Email: demo.submitter@example.com
Password: StrongPass123
```

Use this account to submit transactions. This role should not access regulator anomaly notices.

### Auditor

```text
Email: demo.auditor@example.com
Password: StrongPass123
```

Use this account to demonstrate read-only oversight.

## Demonstration Flow

1. Start backend services.
2. Start frontend service.
3. Log in as bank submitter and submit a transaction.
4. Log in as bank reviewer and approve or screen the transaction.
5. Run SMPC-linked risk evaluation.
6. Log in as regulator and verify evidence.
7. Open an anomaly case from suspicious evidence.
8. Log in as bank reviewer and respond to the anomaly notice.
9. Log in as auditor and demonstrate read-only evidence access.

## Key Defense Statement

The system demonstrates that AML compliance can support suspicious transaction detection, multi-bank collaboration, regulator verification, and audit accountability while reducing unnecessary exposure of sensitive bank and customer data.

## Important Terminal Rule

Do not paste Markdown fence labels such as bash, text, or triple-backtick markers into the terminal.

Only paste the actual command lines shown inside a code block.
