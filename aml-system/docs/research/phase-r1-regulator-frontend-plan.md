# Phase R1 — Regulator Frontend Completion

## Objective
Build the missing React regulator dashboard so the MVP becomes visibly real and product-complete.

## Why this phase is next
The current regulator backend already supports:

- proof listing through `GET /proofs`,
- proof detail retrieval through `GET /proofs/:proof_id`,
- proof verification through `POST /proofs/:proof_id/verify`,
- audit timeline retrieval through `GET /audit/:tx_id`.

This frontend phase therefore builds directly on real backend APIs.

## Chosen frontend stack
- React
- Vite
- JSX
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- Lucide React
- clsx
- date-fns

## Frontend scope
The dashboard must support:

1. proof list page,
2. proof detail page,
3. verify action,
4. audit timeline rendering,
5. privacy-friendly display of proof-linked compliance information.

## Micro Timeline

### R1.A — Scaffold
- create frontend folder and package metadata
- configure Vite
- configure Tailwind
- create router shell
- add environment example

### R1.B — Shared foundations
- create API client
- create response normalizers
- create shared layout shell
- create badge, loading, error, and table helpers

### R1.C — Proof list page
- fetch proofs
- render proof table
- filter by transaction ID / rule ID / status

### R1.D — Proof detail page
- fetch proof by ID
- show proof metadata
- hide raw customer identifiers

### R1.E — Verify action
- trigger proof verification
- update visible verification result

### R1.F — Audit timeline
- fetch and render audit entries linked to transaction ID

### R1.G — Minimal UX pass
- clean table-based layout
- no unnecessary animation or design-system work

### R1.H — Validation
- run local frontend
- connect to live backend
- verify proof list, detail, verification, and audit timeline manually

## Acceptance criteria
Phase R1 is complete only if:
- proof list loads from live backend,
- proof detail works,
- verify action works,
- audit timeline renders,
- all shown data comes from real APIs,
- the UI remains privacy-friendly and avoids raw customer identifiers.