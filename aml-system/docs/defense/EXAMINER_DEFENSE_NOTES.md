# Examiner Defense Notes

## Question: Who identifies suspicious transactions?

The bank identifies suspicious transactions first. The regulator verifies evidence and opens cases later.

## Question: What does SMPC add?

SMPC adds collaborative evidence across banks without exposing raw private inputs.

## Question: What does the regulator see?

The regulator sees proof status, audit evidence, risk level, triggered rules, aggregate evidence, and anomaly cases.

## Question: What does the regulator not see?

The regulator does not receive other banks' raw customer IDs, raw account IDs, or raw transaction payloads.

## Question: How is RBAC demonstrated?

The system enforces role-specific access:

- super admin manages users and organizations
- submitter creates transactions
- reviewer evaluates risk, approves, screens, and generates proofs
- regulator verifies evidence and opens cases
- auditor reads evidence only

## Question: How is privacy shown in the UI?

The bank notice and regulator dashboard explicitly show that raw bank inputs are not exposed.
