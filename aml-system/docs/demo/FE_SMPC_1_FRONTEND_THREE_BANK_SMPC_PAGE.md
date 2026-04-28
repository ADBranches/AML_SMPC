# FE-SMPC-1 Frontend Three-Bank SMPC Demo Page

## Purpose

This page brings the three-bank SMPC collaboration demo into the frontend.

## Route

```text
/regulator/three-bank-smpc-demo

```

## Expected Result

The frontend now exposes a regulator-facing three-bank SMPC collaboration demo page.

The route calls the SMPC runtime through the Vite proxy and shows:

- Bank A, Bank B, and Bank C contributions
- aggregate risk score
- cross-bank overlap count
- raw input disclosure status
- collaboration evidence statement

## Research Framing

The banks are the SMPC-style participants.

The regulator is not treated as a raw-input computation party. The regulator verifies downstream proof and audit evidence.
