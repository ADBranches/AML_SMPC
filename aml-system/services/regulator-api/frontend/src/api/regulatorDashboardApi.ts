import { ApiError } from "./client";
import { env } from "../config/env";
import { getStoredSession } from "../auth/authStore";
import { anomalyCasesApi, type AnomalyCase } from "./anomalyCasesApi";

export type ProofEvidence = {
  id?: string;
  tx_id?: string;
  rule_id?: string;
  verification_status?: string;
  public_signal?: boolean;
  claim_hash?: string;
  proof_blob?: Record<string, unknown>;
};

export type RegulatorDashboardSummary = {
  proofs: ProofEvidence[];
  cases: AnomalyCase[];
  verifiedProofs: number;
  pendingProofReviews: number;
  highRiskCases: number;
  openAnomalyCases: number;
  closedAnomalyCases: number;
  fatfRec10Evidence: number;
  fatfRec11Evidence: number;
  fatfRec16Evidence: number;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getStoredSession();
  const headers = new Headers(init.headers);

  headers.set("Content-Type", "application/json");

  if (session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  const response = await fetch(`${env.regulatorApiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Request failed with HTTP ${response.status}`;

    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
}

export const regulatorDashboardApi = {
  async summary(): Promise<RegulatorDashboardSummary> {
    const [proofs, cases] = await Promise.all([
      request<ProofEvidence[]>("/proofs").catch(() => []),
      anomalyCasesApi.listCases().catch(() => []),
    ]);

    const verifiedProofs = proofs.filter(
      (proof) => proof.verification_status === "verified"
    ).length;

    const pendingProofReviews = proofs.filter(
      (proof) =>
        !proof.verification_status ||
        proof.verification_status === "pending" ||
        proof.verification_status === "unverified"
    ).length;

    const highRiskCases = cases.filter((item) => item.risk_level === "high").length;
    const openAnomalyCases = cases.filter((item) => item.case_status !== "closed").length;
    const closedAnomalyCases = cases.filter((item) => item.case_status === "closed").length;
    const fatfRec10Evidence = proofs.filter((proof) => proof.rule_id === "FATF_REC10").length;
    const fatfRec11Evidence = proofs.filter((proof) => proof.rule_id === "FATF_REC11").length;
    const fatfRec16Evidence = proofs.filter((proof) => proof.rule_id === "FATF_REC16").length;

    return {
      proofs,
      cases,
      verifiedProofs,
      pendingProofReviews,
      highRiskCases,
      openAnomalyCases,
      closedAnomalyCases,
      fatfRec10Evidence,
      fatfRec11Evidence,
      fatfRec16Evidence,
    };
  },
};
