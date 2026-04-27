# AML SMPC Frontend Build Plan

## Stack

React + Vite + TypeScript + Tailwind CSS

## Objective

Build a regulator-facing frontend that can display proofs, verify proofs, and show audit timelines using compliance-safe backend responses.

## Phase Order

- FE0: Backend Contract and Frontend Readiness Check
- FE1: Foundation UI Scaffold
- FE2: Regulator Workflow UI
- FE3: Evidence Dashboard and Performance Visualization
- FE4: Polish, Packaging, and Demo Stability
- FE5: Final Examiner Frontend Package

## FE0 Acceptance Criteria

- API smoke script passes.
- API contract document exists.
- Frontend build plan exists.
- Backend response shapes are confirmed.

## Frontend Safety Rules

- Do not display raw customer identifiers.
- Do not display real customer data.
- Use synthetic transaction IDs for demo workflows.
- Display proof signals and verification status only.
- Keep regulator-facing views simple and evidence-focused.
