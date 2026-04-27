import type { ComplianceStatus, PerformanceEvidence } from "../types/evidence";

export const phaseStatus = [
  {
    phase: "Phase 7.1",
    title: "Functional Testing",
    status: "PASSED",
    description: "HE, SMPC, zk proof generation, and end-to-end API flow validated.",
  },
  {
    phase: "Phase 7.2",
    title: "Performance Testing",
    status: "PASSED",
    description: "Transaction throughput and zk proof latency passed controlled validation.",
  },
  {
    phase: "Phase 7.3",
    title: "Compliance Validation",
    status: "PASSED",
    description: "FATF Recommendation 10, 11, and 16 evidence validated.",
  },
] as const;

export const complianceEvidence: ComplianceStatus[] = [
  {
    recommendation: "R.10",
    title: "Customer Due Diligence",
    status: "PASSED",
    description: "CDD-aligned proof and audit evidence verified.",
  },
  {
    recommendation: "R.11",
    title: "Record Keeping",
    status: "PASSED",
    description: "Transaction, proof, and audit linkage is reconstructable.",
  },
  {
    recommendation: "R.16",
    title: "Payment Transparency / Travel Rule",
    status: "PASSED",
    description: "Payment metadata presence evidence verified without exposing raw institution names in proof claims.",
  },
];

export const performanceEvidence: PerformanceEvidence = {
  transactionRequestCount: 10091,
  transactionFailureCount: 0,
  transactionRequestsPerSecond: 339.92353492474865,
  transactionMedianMs: 200,
  transactionP95Ms: 380,
  transactionP99Ms: 970,
  proofRequestCount: 628,
  proofFailureCount: 0,
  proofMedianMs: 46,
  proofP95Ms: 58,
  proofP99Ms: 66,
};
