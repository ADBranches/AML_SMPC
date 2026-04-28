# Final Submission Checklist

## Project Status

The AML SMPC system is ready for final demonstration and submission after the FINAL-4 repository audit passes.

## Demonstrated Capabilities

- Public landing page
- Registration and pending approval
- Super-admin approval
- JWT login/session
- Frontend RBAC
- Backend RBAC
- Role-specific dashboards
- Transaction submitter workflow
- Transaction reviewer approval workflow
- SMPC screening
- Three-bank SMPC collaboration demo
- zk proof generation
- Regulator proof verification
- Auditor read-only evidence access
- FATF R.10, R.11, and R.16 evidence
- Final validation scripts
- Presentation and examiner defense notes

## Backend Startup

cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system
source env/bin/activate
./scripts/demo/run-frontend-backend.sh

## Frontend Startup

cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/regulator-api/frontend
npm run dev -- --host 127.0.0.1 --port 5173

## Final Validation Commands

cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system
./scripts/demo/run-three-bank-smpc-demo.sh
./scripts/demo/run-demo1-final-objective-validation.sh

cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC
./aml-system/scripts/ci/final-repository-audit.sh

## Submission Rule

Use synthetic records only. Do not submit real customer, bank, regulator, or private institution data.
