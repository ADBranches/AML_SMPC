# AML SMPC Localhost Presentation Run Guide

## Purpose

This guide explains exactly how to run the AML SMPC project on localhost when turning on the computer for presentation, defense, or demo.

The goal is to run:

- backend services
- regulator API
- frontend browser UI
- smoke checks
- final validation/demo scripts

---

## Project Location

```text
/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC
```

Main application folder:

```text
/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system
```

Frontend folder:

```text
/home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/regulator-api/frontend
```

---

## Required Localhost Ports

| Service | URL |
|---|---|
| encryption-service | `http://127.0.0.1:8081` |
| smpc-orchestrator | `http://127.0.0.1:8083` |
| zk-prover | `http://127.0.0.1:8084` |
| regulator-api | `http://127.0.0.1:8085` |
| frontend | `http://127.0.0.1:5173` |

---

## Important Automated Scripts

These scripts were created to reduce manual startup work.

```text
aml-system/scripts/demo/run-frontend-backend.sh
aml-system/scripts/demo/run-frontend-demo.sh
aml-system/scripts/demo/frontend-api-smoke.sh
aml-system/scripts/demo/run-final-demo.sh
aml-system/scripts/demo/run-phase7-3-compliance.sh
aml-system/scripts/ci/verify-phase7-completion.sh
```

### What Each Script Does

| Script | Purpose |
|---|---|
| `run-frontend-backend.sh` | Starts/reuses backend services needed by the frontend |
| `run-frontend-demo.sh` | Starts the React frontend dev server |
| `frontend-api-smoke.sh` | Confirms frontend-facing backend APIs are working |
| `run-final-demo.sh` | Shows final project validation summaries |
| `run-phase7-3-compliance.sh` | Regenerates compliance evidence if missing |
| `verify-phase7-completion.sh` | Verifies Phase 7.1, 7.2, and 7.3 completion |

---

# Full Startup Procedure

Use **three terminals**.

---

## Terminal 1 — Start Backend Services

Open a terminal and run:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system

source env/bin/activate

./scripts/demo/run-frontend-backend.sh
```

Keep this terminal open.

Expected successful output includes:

```text
Backend services are ready:
encryption-service: http://127.0.0.1:8081
smpc-orchestrator:  http://127.0.0.1:8083
zk-prover:          http://127.0.0.1:8084
regulator-api:      http://127.0.0.1:8085
```

---

## Terminal 2 — Confirm Backend APIs

Open a second terminal and run:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system

source env/bin/activate

curl -fsS http://127.0.0.1:8085/health | jq .
```

Expected output:

```json
{
  "status": "ok"
}
```

Now confirm proof and audit data:

```bash
./scripts/demo/frontend-api-smoke.sh TX-PHASE73-R16-001
```

Expected final output:

```text
✅ Frontend API smoke check passed
```

---

## Terminal 3 — Start Frontend

Open a third terminal and run:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/regulator-api/frontend

npm run dev -- --host 127.0.0.1 --port 5173
```

Open the browser:

```text
http://127.0.0.1:5173
```

---

# Browser Demo Flow

## 1. Dashboard

Open:

```text
http://127.0.0.1:5173/dashboard
```

Show:

- backend health
- Phase 7.1 functional status
- Phase 7.2 performance status
- Phase 7.3 compliance status
- FATF Recommendation cards for R.10, R.11, and R.16

---

## 2. Proofs Page

Open:

```text
http://127.0.0.1:5173/proofs
```

Use this transaction ID:

```text
TX-PHASE73-R16-001
```

Click:

```text
Search proofs
```

Expected proof rows:

```text
FATF_REC10
FATF_REC11
FATF_REC16
```

Then click:

```text
View
Verify
```

Expected result:

```text
verified = true
```

---

## 3. Audit Page

Open:

```text
http://127.0.0.1:5173/audit
```

Use this transaction ID:

```text
TX-PHASE73-R16-001
```

Click:

```text
Load audit timeline
```

Expected audit events:

```text
transaction_submitted_and_pseudonymized
sender_screening_completed
receiver_screening_completed
```

---

## 4. Performance Page

Open:

```text
http://127.0.0.1:5173/performance
```

Show:

- transaction throughput
- transaction failure count
- proof request count
- proof latency
- P95 proof latency
- latency bars

---

## 5. About Page

Open:

```text
http://127.0.0.1:5173/about
```

Show:

- project purpose
- technology stack
- compliance scope

---

# Final Project Validation Command

Before the presentation starts, you can run:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system

source env/bin/activate

./scripts/ci/verify-phase7-completion.sh
```

Expected output:

```text
✅ PHASE 7.1, 7.2, AND 7.3 ARE COMPLETE
```

---

# Final Demo Script

To show terminal-based evidence summaries, run:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system

source env/bin/activate

./scripts/demo/run-final-demo.sh
```

Expected final output:

```text
FINAL DEMO COMPLETE
```

---

# If Proof or Audit Data Is Missing

If `/proofs` or `/audit` returns empty data, regenerate compliance evidence.

Run:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system

source env/bin/activate

./scripts/demo/run-phase7-3-compliance.sh all
```

Then rerun:

```bash
./scripts/demo/frontend-api-smoke.sh TX-PHASE73-R16-001
```

Expected:

```text
✅ Frontend API smoke check passed
```

Refresh the browser page after this.

---

# If Frontend Does Not Start

Go to the frontend directory:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/regulator-api/frontend
```

Install packages:

```bash
npm install
```

Build check:

```bash
npm run build
```

Start again:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

---

# If Backend Does Not Start

Run this from the project root:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system

source env/bin/activate

./scripts/ci/verify-phase7-completion.sh
```

If it fails because evidence is stale or missing, run:

```bash
./scripts/demo/run-phase7-3-compliance.sh all
```

Then restart backend:

```bash
./scripts/demo/run-frontend-backend.sh
```

---

# If a Port Is Already in Use

Check the process using a port:

```bash
sudo lsof -i :5173
sudo lsof -i :8085
sudo lsof -i :8084
sudo lsof -i :8083
sudo lsof -i :8081
```

Kill a stuck process carefully:

```bash
sudo kill -9 <PID>
```

Replace `<PID>` with the process ID shown by `lsof`.

---

# Git Cleanliness Before Presentation

From the Git root:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC

git fetch origin --prune

git rev-list --left-right --count HEAD...origin/main

git status -sb
```

Expected:

```text
0	0
## main...origin/main
```

This confirms that the local project and GitHub repository are synced.

---

# Recommended Presentation Order

1. Open frontend dashboard.
2. Show backend health and phase status.
3. Go to Proofs page.
4. Search `TX-PHASE73-R16-001`.
5. View proof details.
6. Verify a proof.
7. Go to Audit page.
8. Load audit timeline.
9. Go to Performance page.
10. Explain throughput and proof latency.
11. Run `./scripts/demo/run-final-demo.sh` only if terminal evidence is requested.

---

# Quick Startup Summary

Use this when you already know the process.

## Terminal 1

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system
source env/bin/activate
./scripts/demo/run-frontend-backend.sh
```

## Terminal 2

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system
source env/bin/activate
./scripts/demo/frontend-api-smoke.sh TX-PHASE73-R16-001
```

## Terminal 3

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/regulator-api/frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Browser:

```text
http://127.0.0.1:5173
```

---

# Final Success Criteria

The presentation setup is ready when:

```text
regulator API health is ok
frontend API smoke check passes
frontend opens at http://127.0.0.1:5173
proof search returns FATF_REC10, FATF_REC11, FATF_REC16
audit timeline returns at least 3 events
performance page displays metrics
verify-phase7-completion.sh passes
```
