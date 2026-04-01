# Phase R0 Populated Files

## `docs/demo/demo-environment-baseline.md`

```md
# Demo Environment Baseline

This document defines the **official local/demo environment baseline** for the AML system.

## Official environment values

```bash
DATABASE_URL=postgresql://aml_dev:securepassword@localhost:5434/aml_dev
SOFTHSM2_CONF=./infra/softhsm/conf/softhsm2.conf
RUST_LOG=info
PSEUDO_SALT=dev_demo_salt_change_me

ENCRYPTION_SERVICE_BASE_URL=http://127.0.0.1:8081
HE_GATEWAY_BASE_URL=http://127.0.0.1:8082
SMPC_BASE_URL=http://127.0.0.1:8083
ZK_PROVER_BASE_URL=http://127.0.0.1:8084
REGULATOR_API_BASE_URL=http://127.0.0.1:8085

DEMO_TX_ID=TX-E2E-001
PERF_PROOF_TX_ID=TX-E2E-001
COMPLIANCE_TX_ID=TX-E2E-001
```

## Active scripts to use

### Official active Phase 7 wrappers
- `scripts/demo/run_phase7_1.sh`
- `scripts/demo/run_phase7_2.sh`
- `scripts/demo/run_phase7_3.sh`
- `scripts/demo/run-phase7-validation.sh`

### Historical demo wrappers retained for earlier phases
- `scripts/demo/run-phase2-demo.sh`
- `scripts/demo/run-phase3-integrated-demo.sh`
- `scripts/demo/run-phase4-demo.sh`
- `scripts/demo/run-phase5-demo.sh`
- `scripts/demo/run-phase6-demo.sh`

> Rule: use the **Phase 7 underscore wrappers** for current validation work. Keep earlier hyphen scripts as historical/demo scaffolds unless they are explicitly being updated.

## Startup baseline

1. Load the environment:

```bash
source scripts/demo/demo-env.sh
```

2. Check prerequisites:

```bash
bash scripts/demo/verify-demo-prereqs.sh
```

3. Run the required phase script.

## Canonical seed transaction path

The official seed/demo transaction reference is:

```text
TX-E2E-001
```

It is currently used for:
- API end-to-end validation,
- proof generation baselining,
- performance proof benchmarking,
- compliance validation.

## Reset baseline

Until a dedicated reset script is finalized in later phases, use the integration seed path driven by:

```bash
bash tests/integration/api_end_to_end_test.sh
```

This script recreates the deterministic transaction/proof path for `TX-E2E-001` by cleaning prior DB artifacts and inserting fresh transaction/audit/proof state.

```

## `docs/research/phase-r0-stabilization-plan.md`

```md
# Phase R0 — Environment Stabilization and Project Hygiene

## Objective
Create a stable and reproducible baseline before completing remaining product-facing and deployment-facing work.

## Why this phase exists
The current repo already has a strong backend and validation base, but startup assumptions are still spread across:

- `.env`
- `.env.example`
- `Makefile`
- demo scripts
- CI scripts
- test wrappers

Phase R0 brings those assumptions into **one official baseline**.

---

## Official baseline decisions for R0

### Canonical database connection

```text
DATABASE_URL=postgresql://aml_dev:securepassword@localhost:5434/aml_dev
```

### Canonical service base URLs

```text
ENCRYPTION_SERVICE_BASE_URL=http://127.0.0.1:8081
HE_GATEWAY_BASE_URL=http://127.0.0.1:8082
SMPC_BASE_URL=http://127.0.0.1:8083
ZK_PROVER_BASE_URL=http://127.0.0.1:8084
REGULATOR_API_BASE_URL=http://127.0.0.1:8085
```

### Canonical demo/testing transaction references

```text
DEMO_TX_ID=TX-E2E-001
PERF_PROOF_TX_ID=TX-E2E-001
COMPLIANCE_TX_ID=TX-E2E-001
```

### Canonical environment support values

```text
PSEUDO_SALT=dev_demo_salt_change_me
RUST_LOG=info
SOFTHSM2_CONF=./infra/softhsm/conf/softhsm2.conf
```

---

## R0 Deliverables

### Documents
- `docs/research/phase-r0-stabilization-plan.md`
- `docs/demo/demo-environment-baseline.md`

### Scripts
- `scripts/dev/load-env.sh`
- `scripts/dev/check-env-consistency.sh`
- `scripts/demo/demo-env.sh`
- `scripts/demo/verify-demo-prereqs.sh`

### Tests
- `tests/environment/env_consistency_test.sh`
- `tests/environment/script_naming_test.sh`
- `tests/environment/evidence_layout_test.sh`
- `tests/environment/demo_seed_reference_test.sh`
- `tests/environment/README.md`

---

## Micro Timeline

### R0.A — Freeze the environment
- align `.env` and `.env.example`
- align `Makefile` DB defaults with env defaults
- define canonical service URLs
- define canonical demo transaction IDs

### R0.B — Normalize script usage
- document the active scripts to use
- reduce ambiguity between historical wrappers and active wrappers
- ensure demo helpers can load one common environment profile

### R0.C — Enforce folder hygiene
- evidence directories store artifacts only
- logs directories store logs only
- execution scripts live only in execution folders

### R0.D — Document the official demo baseline
- define startup assumptions
- define reset/seed assumptions
- define official transaction seed references

### R0.E — Validate the baseline
- run environment consistency test
- run script naming test
- run evidence layout test
- run seed reference test

---

## Completion Criteria

Phase R0 is complete only if:

- `.env` and `.env.example` match on official baseline values,
- environment helper scripts load the same values every time,
- demo prerequisite checks pass,
- the environment validation tests pass,
- official startup assumptions are documented in the repo.

```

## `scripts/demo/demo-env.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/dev/load-env.sh"

export ENCRYPTION_SERVICE_BASE_URL="${ENCRYPTION_SERVICE_BASE_URL:-http://127.0.0.1:8081}"
export HE_GATEWAY_BASE_URL="${HE_GATEWAY_BASE_URL:-http://127.0.0.1:8082}"
export SMPC_BASE_URL="${SMPC_BASE_URL:-http://127.0.0.1:8083}"
export ZK_PROVER_BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
export REGULATOR_API_BASE_URL="${REGULATOR_API_BASE_URL:-http://127.0.0.1:8085}"

export DEMO_TX_ID="${DEMO_TX_ID:-TX-E2E-001}"
export PERF_PROOF_TX_ID="${PERF_PROOF_TX_ID:-$DEMO_TX_ID}"
export COMPLIANCE_TX_ID="${COMPLIANCE_TX_ID:-$DEMO_TX_ID}"

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  echo "[info] demo environment loaded"
  echo "DATABASE_URL=$DATABASE_URL"
  echo "ENCRYPTION_SERVICE_BASE_URL=$ENCRYPTION_SERVICE_BASE_URL"
  echo "HE_GATEWAY_BASE_URL=$HE_GATEWAY_BASE_URL"
  echo "SMPC_BASE_URL=$SMPC_BASE_URL"
  echo "ZK_PROVER_BASE_URL=$ZK_PROVER_BASE_URL"
  echo "REGULATOR_API_BASE_URL=$REGULATOR_API_BASE_URL"
  echo "DEMO_TX_ID=$DEMO_TX_ID"
  echo "PERF_PROOF_TX_ID=$PERF_PROOF_TX_ID"
  echo "COMPLIANCE_TX_ID=$COMPLIANCE_TX_ID"
fi

```

## `scripts/demo/verify-demo-prereqs.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/demo/demo-env.sh"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "[error] missing required command: $1"; exit 1; }
}

require_file() {
  [[ -f "$1" ]] || { echo "[error] missing required file: $1"; exit 1; }
}

require_cmd psql
require_cmd cargo
require_cmd cmake
require_cmd curl
require_cmd jq
require_cmd bash

require_file "$ROOT_DIR/.env"
require_file "$ROOT_DIR/.env.example"
require_file "$ROOT_DIR/Makefile"
require_file "$ROOT_DIR/services/he-orchestrator/seal-core/CMakeLists.txt"
require_file "$ROOT_DIR/services/encryption-service/api/Cargo.toml"
require_file "$ROOT_DIR/services/he-orchestrator/rust-gateway/Cargo.toml"
require_file "$ROOT_DIR/services/smpc-orchestrator/runtime/Cargo.toml"
require_file "$ROOT_DIR/services/zk-prover/prover/Cargo.toml"
require_file "$ROOT_DIR/services/regulator-api/backend/Cargo.toml"

psql "$DATABASE_URL" -Atqc "SELECT 1;" | grep -qx '1'
psql "$DATABASE_URL" -Atqc "SELECT to_regclass('public.transactions');" | grep -qx 'transactions'
psql "$DATABASE_URL" -Atqc "SELECT to_regclass('public.audit_logs');" | grep -qx 'audit_logs'
psql "$DATABASE_URL" -Atqc "SELECT to_regclass('public.proofs');" | grep -qx 'proofs'

[[ "$DEMO_TX_ID" == "TX-E2E-001" ]] || { echo "[error] unexpected DEMO_TX_ID: $DEMO_TX_ID"; exit 1; }
[[ "$PERF_PROOF_TX_ID" == "TX-E2E-001" ]] || { echo "[error] unexpected PERF_PROOF_TX_ID: $PERF_PROOF_TX_ID"; exit 1; }
[[ "$COMPLIANCE_TX_ID" == "TX-E2E-001" ]] || { echo "[error] unexpected COMPLIANCE_TX_ID: $COMPLIANCE_TX_ID"; exit 1; }

echo "[ok] demo prerequisites verified"

```

## `scripts/dev/check-env-consistency.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE_FILE="$ROOT_DIR/.env.example"
MAKEFILE="$ROOT_DIR/Makefile"

require_file() {
  [[ -f "$1" ]] || { echo "[error] missing file: $1"; exit 1; }
}

extract_var_from_file() {
  local file="$1" key="$2"
  grep -E "^${key}=" "$file" | tail -n1 | cut -d'=' -f2-
}

require_file "$ENV_FILE"
require_file "$ENV_EXAMPLE_FILE"
require_file "$MAKEFILE"

ENV_DB="$(extract_var_from_file "$ENV_FILE" DATABASE_URL)"
ENV_EXAMPLE_DB="$(extract_var_from_file "$ENV_EXAMPLE_FILE" DATABASE_URL)"
ENV_SOFTHSM="$(extract_var_from_file "$ENV_FILE" SOFTHSM2_CONF)"
ENV_EXAMPLE_SOFTHSM="$(extract_var_from_file "$ENV_EXAMPLE_FILE" SOFTHSM2_CONF)"
ENV_RUST_LOG="$(extract_var_from_file "$ENV_FILE" RUST_LOG)"
ENV_EXAMPLE_RUST_LOG="$(extract_var_from_file "$ENV_EXAMPLE_FILE" RUST_LOG)"
MAKE_DB_PORT="$(grep -E '^DB_PORT \?=' "$MAKEFILE" | awk '{print $3}')"

fail=0

if [[ -z "$ENV_DB" || -z "$ENV_EXAMPLE_DB" ]]; then
  echo "[error] DATABASE_URL missing from .env or .env.example"
  fail=1
fi

if [[ "$ENV_DB" != "$ENV_EXAMPLE_DB" ]]; then
  echo "[error] DATABASE_URL mismatch"
  echo "  .env         = $ENV_DB"
  echo "  .env.example = $ENV_EXAMPLE_DB"
  fail=1
fi

if [[ "$ENV_SOFTHSM" != "$ENV_EXAMPLE_SOFTHSM" ]]; then
  echo "[error] SOFTHSM2_CONF mismatch"
  fail=1
fi

if [[ "$ENV_RUST_LOG" != "$ENV_EXAMPLE_RUST_LOG" ]]; then
  echo "[error] RUST_LOG mismatch"
  fail=1
fi

if [[ "$ENV_DB" != *":${MAKE_DB_PORT}/"* ]]; then
  echo "[error] Makefile DB_PORT ($MAKE_DB_PORT) does not match DATABASE_URL ($ENV_DB)"
  fail=1
fi

for script in "$ROOT_DIR"/scripts/demo/*.sh "$ROOT_DIR"/scripts/ci/*.sh; do
  [[ -f "$script" ]] || continue
  if grep -q 'localhost:5433' "$script"; then
    echo "[error] stale 5433 reference in $script"
    fail=1
  fi
  if grep -q 'localhost:5432' "$script"; then
    echo "[warn] found direct 5432 reference in $script (check if intentional)"
  fi
 done

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi

echo "[ok] environment consistency checks passed"

```

## `scripts/dev/load-env.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE_FILE="$ROOT_DIR/.env.example"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  source "$ENV_FILE"
  set +a
elif [[ -f "$ENV_EXAMPLE_FILE" ]]; then
  set -a
  source "$ENV_EXAMPLE_FILE"
  set +a
fi

export DATABASE_URL="${DATABASE_URL:-postgresql://aml_dev:securepassword@localhost:5434/aml_dev}"
export SOFTHSM2_CONF="${SOFTHSM2_CONF:-./infra/softhsm/conf/softhsm2.conf}"
export RUST_LOG="${RUST_LOG:-info}"
export PSEUDO_SALT="${PSEUDO_SALT:-dev_demo_salt_change_me}"

export ENCRYPTION_SERVICE_BASE_URL="${ENCRYPTION_SERVICE_BASE_URL:-http://127.0.0.1:8081}"
export HE_GATEWAY_BASE_URL="${HE_GATEWAY_BASE_URL:-http://127.0.0.1:8082}"
export SMPC_BASE_URL="${SMPC_BASE_URL:-http://127.0.0.1:8083}"
export ZK_PROVER_BASE_URL="${ZK_PROVER_BASE_URL:-http://127.0.0.1:8084}"
export REGULATOR_API_BASE_URL="${REGULATOR_API_BASE_URL:-http://127.0.0.1:8085}"

export DEMO_TX_ID="${DEMO_TX_ID:-TX-E2E-001}"
export PERF_PROOF_TX_ID="${PERF_PROOF_TX_ID:-TX-E2E-001}"
export COMPLIANCE_TX_ID="${COMPLIANCE_TX_ID:-TX-E2E-001}"

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  cat <<EOF
DATABASE_URL=$DATABASE_URL
SOFTHSM2_CONF=$SOFTHSM2_CONF
RUST_LOG=$RUST_LOG
PSEUDO_SALT=$PSEUDO_SALT
ENCRYPTION_SERVICE_BASE_URL=$ENCRYPTION_SERVICE_BASE_URL
HE_GATEWAY_BASE_URL=$HE_GATEWAY_BASE_URL
SMPC_BASE_URL=$SMPC_BASE_URL
ZK_PROVER_BASE_URL=$ZK_PROVER_BASE_URL
REGULATOR_API_BASE_URL=$REGULATOR_API_BASE_URL
DEMO_TX_ID=$DEMO_TX_ID
PERF_PROOF_TX_ID=$PERF_PROOF_TX_ID
COMPLIANCE_TX_ID=$COMPLIANCE_TX_ID
EOF
fi

```

## `tests/environment/README.md`

```md
# Environment Validation Tests (Phase R0)

These tests validate the R0 baseline.

## Files

- `env_consistency_test.sh` — confirms `.env`, `.env.example`, and `Makefile` are aligned
- `script_naming_test.sh` — confirms the current active script baseline is documented and available
- `evidence_layout_test.sh` — confirms evidence/log folders are disciplined correctly
- `demo_seed_reference_test.sh` — confirms the canonical seed transaction baseline is documented and exported

## Run order

```bash
bash tests/environment/env_consistency_test.sh
bash tests/environment/script_naming_test.sh
bash tests/environment/evidence_layout_test.sh
bash tests/environment/demo_seed_reference_test.sh
```

```

## `tests/environment/demo_seed_reference_test.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$ROOT_DIR/tests/logs/environment"
EVIDENCE_DIR="$ROOT_DIR/tests/evidence/environment"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="$LOG_DIR/demo_seed_reference_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/demo_seed_reference_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

source "$ROOT_DIR/scripts/demo/demo-env.sh"

python3 - <<'PY' "$ROOT_DIR" "$DEMO_TX_ID" "$PERF_PROOF_TX_ID" "$COMPLIANCE_TX_ID" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys
from pathlib import Path
root = Path(sys.argv[1])
demo_tx, perf_tx, comp_tx, log_file, evidence_file = sys.argv[2:7]
baseline_doc = (root / 'docs/demo/demo-environment-baseline.md').read_text(encoding='utf-8')
expected = 'TX-E2E-001'
passed = all(v == expected for v in [demo_tx, perf_tx, comp_tx]) and expected in baseline_doc
record = {
    'test': 'demo_seed_reference_test',
    'DEMO_TX_ID': demo_tx,
    'PERF_PROOF_TX_ID': perf_tx,
    'COMPLIANCE_TX_ID': comp_tx,
    'expected': expected,
    'baseline_doc_contains_expected': expected in baseline_doc,
    'passed': passed,
}
for path in [log_file, evidence_file]:
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(record, f, indent=2)
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] Demo seed reference test completed. Evidence: $EVIDENCE_FILE"

```

## `tests/environment/env_consistency_test.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$ROOT_DIR/tests/logs/environment"
EVIDENCE_DIR="$ROOT_DIR/tests/evidence/environment"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="$LOG_DIR/env_consistency_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/env_consistency_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

set +e
OUTPUT="$($ROOT_DIR/scripts/dev/check-env-consistency.sh 2>&1)"
STATUS=$?
set -e

python3 - <<'PY' "$STATUS" "$OUTPUT" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys
status = int(sys.argv[1])
output = sys.argv[2]
log_file = sys.argv[3]
evidence_file = sys.argv[4]
record = {
    'test': 'env_consistency_test',
    'exit_status': status,
    'passed': status == 0,
    'output': output,
}
for path in [log_file, evidence_file]:
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(record, f, indent=2)
if status != 0:
    raise SystemExit(1)
PY

echo "[PASS] Environment consistency test completed. Evidence: $EVIDENCE_FILE"

```

## `tests/environment/evidence_layout_test.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$ROOT_DIR/tests/logs/environment"
EVIDENCE_DIR="$ROOT_DIR/tests/evidence/environment"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="$LOG_DIR/evidence_layout_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/evidence_layout_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$ROOT_DIR" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys
from pathlib import Path
root = Path(sys.argv[1])
log_file = Path(sys.argv[2])
evidence_file = Path(sys.argv[3])

bad_evidence_scripts = sorted(str(p.relative_to(root)) for p in (root / 'tests/evidence').rglob('*.sh'))
bad_log_json = sorted(str(p.relative_to(root)) for p in (root / 'tests/logs').rglob('*.json'))
passed = not bad_evidence_scripts and not bad_log_json
record = {
    'test': 'evidence_layout_test',
    'bad_evidence_scripts': bad_evidence_scripts,
    'bad_log_json': bad_log_json,
    'passed': passed,
}
for path in [log_file, evidence_file]:
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(record, f, indent=2)
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] Evidence layout test completed. Evidence: $EVIDENCE_FILE"

```

## `tests/environment/script_naming_test.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_DIR="$ROOT_DIR/tests/logs/environment"
EVIDENCE_DIR="$ROOT_DIR/tests/evidence/environment"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="$LOG_DIR/script_naming_test_${TIMESTAMP}.log"
EVIDENCE_FILE="$EVIDENCE_DIR/script_naming_test_${TIMESTAMP}.json"
mkdir -p "$LOG_DIR" "$EVIDENCE_DIR"

python3 - <<'PY' "$ROOT_DIR" "$LOG_FILE" "$EVIDENCE_FILE"
import json, sys
from pathlib import Path
root = Path(sys.argv[1])
log_file = Path(sys.argv[2])
evidence_file = Path(sys.argv[3])

official_doc = root / 'docs/demo/demo-environment-baseline.md'
required_active = [
    'scripts/demo/run_phase7_1.sh',
    'scripts/demo/run_phase7_2.sh',
    'scripts/demo/run_phase7_3.sh',
    'scripts/demo/run-phase7-validation.sh',
]
missing = [p for p in required_active if not (root / p).exists()]
text = official_doc.read_text(encoding='utf-8') if official_doc.exists() else ''
mentioned = all(p in text for p in required_active)
# Fail only if the official baseline doc or the official active scripts are missing.
passed = official_doc.exists() and not missing and mentioned
record = {
    'test': 'script_naming_test',
    'official_doc_exists': official_doc.exists(),
    'missing_active_scripts': missing,
    'official_doc_mentions_active_scripts': mentioned,
    'passed': passed,
}
for path in [log_file, evidence_file]:
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(record, f, indent=2)
if not passed:
    raise SystemExit(1)
PY

echo "[PASS] Script naming test completed. Evidence: $EVIDENCE_FILE"

```
