import { ApiError } from "./client";
import { env } from "../config/env";
import { getStoredSession } from "../auth/authStore";

export type BankNoticeSummary = {
  notice_id: string;
  organization_id: string;
  organization_name: string;
  bank_code: string | null;
  organization_type: string | null;
  notice_status: string;
  bank_response: string | null;
  responded_at: string | null;
  created_at: string | null;
};

export type AnomalyCase = {
  id: string;
  case_ref: string;
  tx_id: string;
  opened_by: string;
  opened_by_email: string | null;
  case_status: string;
  risk_level: string;
  summary: string;
  regulator_finding: string | null;
  required_bank_action: string | null;
  created_at: string;
  updated_at: string;
  bank_notices: BankNoticeSummary[];
};

export type BankAnomalyNotice = {
  notice_id: string;
  case_id: string;
  case_ref: string;
  tx_id: string;
  case_status: string;
  risk_level: string;
  summary: string;
  regulator_finding: string | null;
  required_bank_action: string | null;
  notice_status: string;
  bank_response: string | null;
  responded_at: string | null;
  created_at: string;
  aggregate_evidence_summary: Record<string, unknown>;
};

export type CreateAnomalyCasePayload = {
  tx_id: string;
  summary: string;
  regulator_finding?: string;
  required_bank_action?: string;
  notified_organization_ids?: string[];
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

export const anomalyCasesApi = {
  listCases() {
    return request<AnomalyCase[]>("/regulator/anomaly-cases");
  },

  getCase(caseId: string) {
    return request<AnomalyCase>(`/regulator/anomaly-cases/${encodeURIComponent(caseId)}`);
  },

  createCase(payload: CreateAnomalyCasePayload) {
    return request<AnomalyCase>("/regulator/anomaly-cases", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  closeCase(caseId: string) {
    return request<AnomalyCase>(
      `/regulator/anomaly-cases/${encodeURIComponent(caseId)}/close`,
      { method: "POST" }
    );
  },

  listBankNotices() {
    return request<BankAnomalyNotice[]>("/institution/anomaly-notices");
  },

  getBankNotice(caseId: string) {
    return request<BankAnomalyNotice>(
      `/institution/anomaly-notices/${encodeURIComponent(caseId)}`
    );
  },

  respondToNotice(caseId: string, bankResponse: string) {
    return request<BankAnomalyNotice>(
      `/institution/anomaly-notices/${encodeURIComponent(caseId)}/respond`,
      {
        method: "POST",
        body: JSON.stringify({ bank_response: bankResponse }),
      }
    );
  },
};
