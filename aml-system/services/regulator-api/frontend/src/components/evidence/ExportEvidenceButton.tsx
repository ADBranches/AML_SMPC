import { complianceEvidence, performanceEvidence, phaseStatus } from "../../data/phase7Evidence";
import { Button } from "../ui/Button";

export function ExportEvidenceButton() {
  function exportEvidence() {
    const lines = [
      "# AML SMPC Phase 7 Evidence Summary",
      "",
      "## Phase Status",
      ...phaseStatus.map((item) => "- " + item.phase + ": " + item.status + " - " + item.title),
      "",
      "## Compliance Evidence",
      ...complianceEvidence.map((item) => "- " + item.recommendation + ": " + item.status + " - " + item.title),
      "",
      "## Performance Evidence",
      "- Transaction requests: " + performanceEvidence.transactionRequestCount,
      "- Transaction failures: " + performanceEvidence.transactionFailureCount,
      "- Transaction requests per second: " + performanceEvidence.transactionRequestsPerSecond,
      "- Proof requests: " + performanceEvidence.proofRequestCount,
      "- Proof failures: " + performanceEvidence.proofFailureCount,
      "- Proof P95 latency ms: " + performanceEvidence.proofP95Ms,
      "",
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "aml-smpc-phase7-evidence-summary.md";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="secondary" onClick={exportEvidence}>
      Export evidence summary
    </Button>
  );
}
