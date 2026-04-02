# Frontend Validation Notes (Phase R1)

This folder documents how to validate the regulator frontend manually during Phase R1.

## Manual smoke validation

1. start the regulator backend,
2. start the frontend,
3. open the dashboard,
4. confirm proof list loads,
5. open one proof detail page,
6. trigger proof verification,
7. confirm audit timeline renders.

## Expected visible fields
- proof ID,
- transaction ID,
- rule ID,
- verification status,
- created timestamp,
- audit event list.

## Privacy expectation
The frontend must avoid exposing raw customer identifiers in normal regulator views.
