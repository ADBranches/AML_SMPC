import { apiClient } from "./client";
import { env } from "../config/env";
import type { TransactionPayload } from "../types/transaction";

export type TransactionWorkflowRow = {
  id: string;
  tx_id: string;
  payload: TransactionPayload;
  status: string;
  submitted_by: string;
  submitted_by_email: string;
  reviewed_by: string | null;
  reviewer_email: string | null;
  review_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  screening_started_at: string | null;
  screening_completed_at: string | null;
  proof_generated_at: string | null;
  last_error: string | null;
};

export const transactionWorkflowApi = {
  create(payload: TransactionPayload) {
    return apiClient.post<TransactionWorkflowRow>(
      `${env.regulatorApiBaseUrl}/transactions`,
      payload
    );
  },

  list() {
    return apiClient.get<TransactionWorkflowRow[]>(
      `${env.regulatorApiBaseUrl}/transactions`
    );
  },

  get(txId: string) {
    return apiClient.get<TransactionWorkflowRow>(
      `${env.regulatorApiBaseUrl}/transactions/${encodeURIComponent(txId)}`
    );
  },

  submitForReview(txId: string) {
    return apiClient.post<TransactionWorkflowRow>(
      `${env.regulatorApiBaseUrl}/transactions/${encodeURIComponent(txId)}/submit-for-review`
    );
  },

  approve(txId: string, note: string) {
    return apiClient.post<TransactionWorkflowRow>(
      `${env.regulatorApiBaseUrl}/transactions/${encodeURIComponent(txId)}/approve`,
      { note }
    );
  },

  reject(txId: string, note: string) {
    return apiClient.post<TransactionWorkflowRow>(
      `${env.regulatorApiBaseUrl}/transactions/${encodeURIComponent(txId)}/reject`,
      { note }
    );
  },

  runScreening(txId: string) {
    return apiClient.post<unknown>(
      `${env.regulatorApiBaseUrl}/transactions/${encodeURIComponent(txId)}/run-screening`
    );
  },

  generateProofs(txId: string) {
    return apiClient.post<unknown>(
      `${env.regulatorApiBaseUrl}/transactions/${encodeURIComponent(txId)}/generate-proofs`
    );
  },
};
