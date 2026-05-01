# Suspicious Transaction Rule Engine

## Purpose

Suspicious transactions are identified at the bank side before regulator verification.

## Rule Examples

Implemented AML rule categories include:

- AMOUNT_HIGH_VALUE
- CROSS_BORDER_TRANSFER
- MISSING_PAYMENT_TRANSPARENCY
- HIGH_RISK_COUNTERPARTY
- CDD_INCOMPLETE
- SMPC_CROSS_BANK_OVERLAP
- SANCTIONS_SCREEN_ATTENTION

## Risk Fields

Each risk-evaluated transaction stores:

- risk_score
- risk_level
- suspicion_status
- triggered_rules
- recommended_action
- review_notes
- screened_by
- screened_at

## Risk Levels

- low: 0–39
- medium: 40–69
- high: 70+

## Suspicion Statuses

- not_evaluated
- not_suspicious
- under_review
- suspicious

## Demonstration Value

This proves that the bank identifies suspicious activity first and only later escalates evidence for regulator verification.
