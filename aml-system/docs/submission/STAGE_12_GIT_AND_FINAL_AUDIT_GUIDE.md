# Stage 12 — Git and Final Audit Guide

## Objective

This guide closes the enterprise-grade AML SMPC implementation branch and moves the project into final audit, review, merge, rehearsal, and defense readiness.

The completed branch now includes partner-bank onboarding, RBAC permission enforcement, suspicious transaction risk evaluation, SMPC-linked screening evidence, regulator anomaly case workflow, bank anomaly notice response, auditor read-only evidence access, demo seeding, and validation scripts.

---

## Current Validation Evidence

The recent validation sessions confirmed:

- partner-bank-only registration rejects non-partner banks
- partner-bank registration succeeds as pending approval
- super admin approval activates pending users
- approved users receive organization scope, role, and permissions
- submitters cannot approve transactions
- submitters cannot evaluate suspicious risk
- reviewers can evaluate suspicious risk
- reviewers can approve transactions
- risk_score is saved
- triggered_rules are saved
- suspicious transaction records return saved risk fields
- regulator can open anomaly cases
- auditor can read anomaly cases
- auditor cannot update or close anomaly cases
- banks can see scoped anomaly notices
- banks can respond to anomaly notices
- submitters cannot read anomaly notices
- bank-facing aggregate evidence does not expose raw bank inputs
- backend build passes
- frontend build passes
- full enterprise demo validation passes

---

## Step 1 — Confirm Current Branch

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC

git fetch origin --prune
git status -sb
git branch --show-current
git log --oneline --decorate -5
```

Expected branch:

```text
bank-rbac-suspicion-case-workflow
```

---

## Step 2 — Add Final Stage Files

Run from the repository root:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC

git status -sb

git add aml-system/infra/postgres/migrations/008_partner_bank_identity_and_permissions.sql
git add aml-system/infra/postgres/migrations/009_suspicion_rules_and_transaction_risk.sql
git add aml-system/infra/postgres/migrations/010_regulator_anomaly_cases.sql
git add aml-system/services/regulator-api/backend/src
git add aml-system/services/regulator-api/frontend/src
git add aml-system/scripts/dev/seed_bank_rbac_case_demo.py
git add aml-system/scripts/ci/validate-bank-rbac-identity.sh
git add aml-system/scripts/ci/validate-suspicious-transaction-rules.sh
git add aml-system/scripts/ci/validate-regulator-anomaly-case-flow.sh
git add aml-system/scripts/ci/validate-full-enterprise-demo.sh
git add aml-system/docs/demo
git add aml-system/docs/defense
git add aml-system/docs/submission

git status -sb
```

---

## Step 3 — Commit Enterprise Workflow

```bash
git commit -m "Add partner bank RBAC suspicion and anomaly case workflow"
```

Then push the feature branch:

```bash
git push origin bank-rbac-suspicion-case-workflow
```

---

## Step 4 — Review Before Main Merge

Before merging into main, confirm that the branch contains the expected enterprise workflow commits:

```bash
git log --oneline --decorate -8
```

Expected recent work should include commits for:

- partner bank identity registration workflow
- RBAC permission attribute matrix
- bank-side suspicious transaction risk evaluation
- suspicious transaction frontend pages
- SMPC screening evidence linked to bank-side risk
- regulator anomaly case workflow and bank dashboard notices
- regulator dashboard furnishing and demo seeder
- Stage 9/10 validation scripts and documentation

---

## Step 5 — Merge After Review

Preferred route: open a pull request from `bank-rbac-suspicion-case-workflow` into `main`, review it, then merge.

If local merge is allowed after review, run:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC

git checkout main
git pull origin main
git merge bank-rbac-suspicion-case-workflow
git push origin main
```

---

## Step 6 — Final Repository Sync Check

After merging and pushing main:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC

git fetch origin --prune
git rev-list --left-right --count HEAD...origin/main
git status -sb
```

Expected:

```text
0 0
## main...origin/main
```

---

## Step 7 — Final Audit Scripts

Run:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC

./aml-system/scripts/ci/final-repository-audit.sh
./aml-system/scripts/demo/final-presentation-rehearsal-check.sh
```

Expected:

```text
FINAL-4 REPOSITORY AUDIT PASSED
FINAL-5 PRESENTATION REHEARSAL CHECK PASSED
```

---

## Step 8 — Enterprise Validation Scripts

Run the enterprise workflow validators when backend services are running:

```bash
cd /home/trovas/Downloads/sem32/a_final_year_project/AML_SMPC/aml-system

./scripts/ci/validate-bank-rbac-identity.sh
./scripts/ci/validate-suspicious-transaction-rules.sh
./scripts/ci/validate-regulator-anomaly-case-flow.sh
./scripts/ci/validate-full-enterprise-demo.sh
```

Expected:

```text
BANK RBAC IDENTITY VALIDATION PASSED
SUSPICIOUS TRANSACTION RULES VALIDATION PASSED
REGULATOR ANOMALY CASE FLOW VALIDATION PASSED
FULL ENTERPRISE DEMO VALIDATION PASSED
```

---

## Final Target State

After completing this guide, the application should demonstrate:

1. Partner-bank-only user onboarding.
2. Strong identity binding between user and bank.
3. Explicit RBAC permission attributes.
4. Bank-side suspicious transaction identification.
5. SMPC-supported cross-bank collaboration.
6. Regulator proof and audit verification.
7. Regulator anomaly case creation.
8. Bank-side anomaly notice response.
9. Auditor read-only evidence inspection.
10. No raw private bank data exposed across banks or to the regulator.

---

## Defense Framing

This is the stronger enterprise-grade version of the AML SMPC prototype.

The system should be presented as a privacy-preserving AML compliance prototype where:

- banks perform operational AML screening
- partner-bank users are scoped to approved institutions
- suspicious transactions are evaluated before regulator escalation
- SMPC-style collaboration supports cross-bank evidence
- zk-style proof records support regulator verification
- audit logs support traceability
- anomaly cases create regulator-to-bank feedback
- bank notices expose only scoped aggregate evidence
- auditors inspect evidence in read-only mode
- raw private bank data is not exposed across banks or to the regulator

---

## Final Rule

No new core implementation should be added after this stage unless final audit or defense rehearsal exposes a real blocker.

The project should now shift to:

- clean repository state
- repeatable demo execution
- supervisor review
- final defense rehearsal
- submission readiness

## Terminal Safety Rule

Do not paste Markdown fence labels such as bash, text, or triple-backtick markers into the terminal.

Only paste actual command lines into the shell.
