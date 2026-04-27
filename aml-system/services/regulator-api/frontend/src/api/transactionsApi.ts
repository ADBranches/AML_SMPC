import { apiClient } from "./client";
import { env } from "../config/env";
import type { TransactionPayload, TransactionSubmitResponse } from "../types/transaction";

const baseUrl = env.encryptionApiBaseUrl;

export const transactionsApi = {
  submit(payload: TransactionPayload) {
    return apiClient.post<TransactionSubmitResponse>(
      `${baseUrl}/transactions/submit`,
      payload,
      { timeoutMs: 15000 }
    );
  },
};
