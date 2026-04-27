export type PhaseStatus = "PASSED" | "REVIEW_REQUIRED" | "PENDING";

export type PerformanceEvidence = {
  transactionRequestCount: number;
  transactionFailureCount: number;
  transactionRequestsPerSecond: number;
  proofRequestCount: number;
  proofFailureCount: number;
  proofMedianMs: number;
  proofP95Ms: number;
  proofP99Ms: number;
};

export type ComplianceStatus = {
  recommendation: string;
  title: string;
  status: PhaseStatus;
  description: string;
};
