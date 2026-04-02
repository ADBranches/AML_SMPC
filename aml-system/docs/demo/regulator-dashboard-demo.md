# Regulator Dashboard Demo Guide

## Purpose
This document explains how to run and validate the regulator dashboard locally against the live regulator backend.

## Prerequisites
- backend stack running locally,
- regulator API reachable at the configured base URL,
- frontend dependencies installed,
- regulator backend CORS must allow the Vite dev origin.

## Environment
Create `.env` from `.env.example` inside `services/regulator-api/frontend/` if needed.

```bash
VITE_REGULATOR_API_BASE_URL=http://127.0.0.1:8085