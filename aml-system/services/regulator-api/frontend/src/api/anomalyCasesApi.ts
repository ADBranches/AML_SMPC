import { apiClient } from "./client";

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

export const anomalyCasesApi = {
  // -------- Regulator --------

  listCases() {
    return apiClient.get<AnomalyCase[]>("/regulator/anomaly-cases");
  },

  getCase(caseId: string) {
    return apiClient.get<AnomalyCase>(
      `/regulator/anomaly-cases/${encodeURIComponent(caseId)}`
    );
  },

  createCase(payload: CreateAnomalyCasePayload) {
    return apiClient.post<AnomalyCase>("/regulator/anomaly-cases", payload);
  },

  closeCase(caseId: string) {
    return apiClient.post<AnomalyCase>(
      `/regulator/anomaly-cases/${encodeURIComponent(caseId)}/close`
    );
  },

  // -------- Institution --------

  listBankNotices() {
    return apiClient.get<BankAnomalyNotice[]>("/institution/anomaly-notices");
  },

  getBankNotice(caseId: string) {
    return apiClient.get<BankAnomalyNotice>(
      `/institution/anomaly-notices/${encodeURIComponent(caseId)}`
    );
  },

  respondToNotice(caseId: string, bankResponse: string) {
    return apiClient.post<BankAnomalyNotice>(
      `/institution/anomaly-notices/${encodeURIComponent(caseId)}/respond`,
      { bank_response: bankResponse }
    );
  },
};
