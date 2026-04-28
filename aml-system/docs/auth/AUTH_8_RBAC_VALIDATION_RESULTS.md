# AUTH-8 RBAC Validation Results

## Result

PASSED

## Transaction Tested

`TX-AUTH8-20260428090903`

## Evidence Counts

- Proof count: 3
- Audit count: 3

## Verified Capabilities

- super_admin can manage users.
- transaction_submitter can create transaction workflow requests.
- transaction_submitter cannot approve transactions.
- transaction_reviewer can approve transactions.
- transaction_reviewer can run SMPC screening.
- transaction_reviewer can trigger proof generation.
- transaction_submitter cannot access regulator proofs.
- regulator can read proofs.
- regulator can read audit timeline.
- regulator can verify proofs.
- auditor can read proofs.
- auditor cannot verify proofs.
