export type PhaseStatus = "PASSED" | "REVIEW_REQUIRED" | "PENDING";

export type ComplianceEvidence = {
  recommendation: string;
  title: string;
  status: PhaseStatus;
  description: string;
};

export type PerformanceEvidence = {
  transactionRequestCount: number;
  transactionFailureCount: number;
  transactionRequestsPerSecond: number;
  transactionMedianMs: number;
  transactionP95Ms: number;
  transactionP99Ms: number;
  proofRequestCount: number;
  proofFailureCount: number;
  proofMedianMs: number;
  proofP95Ms: number;
  proofP99Ms: number;
};
