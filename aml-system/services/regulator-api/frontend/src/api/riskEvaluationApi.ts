import { ApiError } from "./client";
import { env } from "../config/env";
import { getStoredSession } from "../auth/authStore";

export type TriggeredRiskRule = {
  rule_code: string;
  rule_name: string;
  risk_weight: number;
  reason: string;
};

export type TransactionWorkflow = {
  id: string;
  tx_id: string;
  status: string;
  payload: Record<string, unknown>;
  submitted_by_email?: string | null;
  reviewer_email?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  risk_score?: number | null;
  risk_level?: string | null;
  suspicion_status?: string | null;
  triggered_rules?: TriggeredRiskRule[] | unknown[] | null;
  recommended_action?: string | null;
  risk_review_notes?: string | null;
  risk_screened_by?: string | null;
  risk_screened_by_email?: string | null;
  risk_screened_at?: string | null;
};

export type RiskEvaluationResponse = {
  tx_id: string;
  risk_score: number;
  risk_level: string;
  suspicion_status: string;
  triggered_rules: TriggeredRiskRule[];
  recommended_action: string;
  reviewer: string;
  screened_at: string;
  workflow: TransactionWorkflow;
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

export const riskEvaluationApi = {
  listTransactions() {
    return request<TransactionWorkflow[]>("/transactions");
  },

  getTransaction(txId: string) {
    return request<TransactionWorkflow>(`/transactions/${encodeURIComponent(txId)}`);
  },

  evaluateRisk(txId: string, reviewNotes: string) {
    return request<RiskEvaluationResponse>(
      `/transactions/${encodeURIComponent(txId)}/evaluate-risk`,
      {
        method: "POST",
        body: JSON.stringify({ review_notes: reviewNotes }),
      }
    );
  },

  async listSuspiciousTransactions() {
    const rows = await request<TransactionWorkflow[]>("/transactions");

    return rows.filter((row) => {
      const riskScore = Number(row.risk_score || 0);
      const riskLevel = String(row.risk_level || "").toLowerCase();
      const status = String(row.suspicion_status || "").toLowerCase();

      return (
        riskScore > 0 ||
        riskLevel === "medium" ||
        riskLevel === "high" ||
        status === "under_review" ||
        status === "suspicious"
      );
    });
  },
};
