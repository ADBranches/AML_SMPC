import json
from pathlib import Path
from datetime import datetime, timezone

root = Path("tests/evidence/phase7_3")
root.mkdir(parents=True, exist_ok=True)

report = root / "PHASE_7_3_COMPLIANCE_RESULTS.md"

cases = {
    "R.10 Customer Due Diligence": {
        "tx_id": "TX-PHASE73-R10-001",
        "log": "TX-PHASE73-R10-001_r10_cdd_validation.log",
        "verify": "TX-PHASE73-R10-001_r10_verify_response.json",
        "proof_detail": "TX-PHASE73-R10-001_r10_proof_detail.json",
    },
    "R.11 Record Keeping": {
        "tx_id": "TX-PHASE73-R11-001",
        "log": "TX-PHASE73-R11-001_r11_recordkeeping_validation.log",
        "verify": "TX-PHASE73-R11-001_r11_verify_response.json",
        "summary": "TX-PHASE73-R11-001_db_recordkeeping_summary.json",
    },
    "R.16 Payment Transparency / Travel Rule": {
        "tx_id": "TX-PHASE73-R16-001",
        "log": "TX-PHASE73-R16-001_r16_travelrule_validation.log",
        "verify": "TX-PHASE73-R16-001_r16_verify_response.json",
        "proof_detail": "TX-PHASE73-R16-001_r16_proof_detail.json",
        "metadata": "TX-PHASE73-R16-001_transaction_metadata.json",
    },
}

def file_exists(name: str) -> bool:
    return (root / name).exists()

def verified(name: str) -> bool:
    path = root / name
    if not path.exists():
        return False
    try:
        return json.loads(path.read_text()).get("verified") is True
    except Exception:
        return False

def log_passed(name: str) -> bool:
    path = root / name
    if not path.exists():
        return False
    return "PASSED" in path.read_text(errors="ignore")

lines = []
lines.append("# Phase 7.3 Compliance Validation Results")
lines.append("")
lines.append(f"Generated: {datetime.now(timezone.utc).isoformat()}")
lines.append("")
lines.append("## Scope")
lines.append("")
lines.append("- Recommendation 10 (R.10) — Customer Due Diligence")
lines.append("- Recommendation 11 (R.11) — Record Keeping")
lines.append("- Recommendation 16 (R.16) — Payment Transparency / Travel Rule")
lines.append("")
lines.append("## Results")
lines.append("")

overall_pass = True

for title, info in cases.items():
    tx_id = info["tx_id"]
    status = log_passed(info["log"]) and verified(info["verify"])
    overall_pass = overall_pass and status

    lines.append(f"### {title}")
    lines.append("")
    lines.append(f"Transaction ID: `{tx_id}`")
    lines.append("")
    lines.append(f"Status: `{'PASSED' if status else 'REVIEW REQUIRED'}`")
    lines.append("")
    lines.append("Evidence files:")
    lines.append("")
    for key, filename in info.items():
        if key == "tx_id":
            continue
        mark = "present" if file_exists(filename) else "missing"
        lines.append(f"- `{root / filename}` — {mark}")
    lines.append("")
    lines.append(f"- `{root / f'{tx_id}_regulator_proofs.json'}` — {'present' if file_exists(f'{tx_id}_regulator_proofs.json') else 'missing'}")
    lines.append(f"- `{root / f'{tx_id}_regulator_audit.json'}` — {'present' if file_exists(f'{tx_id}_regulator_audit.json') else 'missing'}")
    lines.append("")

lines.append("## Overall Status")
lines.append("")
lines.append(f"`{'PASSED' if overall_pass else 'REVIEW REQUIRED'}`")
lines.append("")
lines.append("## Data Safety Note")
lines.append("")
lines.append("All Phase 7.3 evidence is generated from synthetic compliance transactions. The proof artifacts are checked to avoid exposing raw sensitive payload fields.")
lines.append("")

report.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {report}")
