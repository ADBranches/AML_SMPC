# Final Presentation Browser Tab Plan

## Frontend Tabs

| Tab | URL | Purpose |
|---|---|---|
| 1 | http://127.0.0.1:5173/ | Public landing page |
| 2 | http://127.0.0.1:5173/login | Login page |
| 3 | http://127.0.0.1:5173/register | Registration page |
| 4 | http://127.0.0.1:5173/super-admin/dashboard | Super admin governance |
| 5 | http://127.0.0.1:5173/institution/transactions/new | Submitter workflow |
| 6 | http://127.0.0.1:5173/institution/transactions | Reviewer transaction queue |
| 7 | http://127.0.0.1:5173/regulator/proofs | Regulator proof review |
| 8 | http://127.0.0.1:5173/regulator/audit | Audit evidence |
| 9 | http://127.0.0.1:5173/regulator/compliance-report | FATF compliance evidence |

## Terminal Tabs

| Terminal | Directory | Command |
|---|---|---|
| Backend | aml-system | source env/bin/activate && ./scripts/demo/run-frontend-backend.sh |
| Frontend | services/regulator-api/frontend | npm run dev -- --host 127.0.0.1 --port 5173 |
| Three-bank demo | aml-system | ./scripts/demo/run-three-bank-smpc-demo.sh |
| Final validation | aml-system | ./scripts/demo/run-demo1-final-objective-validation.sh |
| Repository audit | repo root | ./aml-system/scripts/ci/final-repository-audit.sh |

## Warning

Do not run `fuser -k` during the presentation unless you intentionally want to stop backend services.
