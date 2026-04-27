# AML SMPC Context Diagram

## Context Flow

Financial Institution / Demo User
        |
        v
AML SMPC Prototype
        |
        v
Regulator / Examiner Evidence Review

## Explanation

A financial institution or demo user submits a synthetic transaction into the AML SMPC prototype.

The prototype performs pseudonymization, SMPC screening, encrypted amount processing, audit logging, and zk proof generation.

A regulator or examiner reviews proof and audit evidence through the regulator-facing API without requiring exposure of raw customer data.

## Main External Actors

- Financial Institution / Demo User
- Regulator / Examiner

## Main System Boundary

- AML SMPC Prototype

## Data Safety Note

The diagram is for synthetic demonstration workflows only. No real customer data should be used in demo submissions, logs, evidence, or reports.
