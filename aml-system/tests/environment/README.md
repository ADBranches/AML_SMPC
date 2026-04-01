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