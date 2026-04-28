# Final Delivery Readiness Checklist

## Before Presentation

- [ ] Backend starts successfully.
- [ ] Frontend starts successfully.
- [ ] Browser tabs are prepared.
- [ ] Terminal font is readable.
- [ ] Demo credentials are ready.
- [ ] Project report/proposal is ready.
- [ ] Final defense notes are ready.
- [ ] No real customer, bank, or transaction data is used.

## Required Commands

### Backend

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system
source env/bin/activate
./scripts/demo/run-frontend-backend.sh
```

### Frontend

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system/services/regulator-api/frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

### Final Validation

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system
./scripts/demo/run-three-bank-smpc-demo.sh
./scripts/demo/run-demo1-final-objective-validation.sh
```

## Expected Results

```text
BANK-1 THREE-BANK SMPC COLLABORATION DEMO PASSED
DEMO-1 FINAL PROJECT OBJECTIVE VALIDATION PASSED
FINAL-4 REPOSITORY AUDIT PASSED
```

## Final Delivery Rule

Do not modify core implementation during final rehearsal. Only rehearse, validate, present, and submit.
