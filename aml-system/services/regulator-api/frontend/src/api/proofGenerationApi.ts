import { apiClient } from "./client";
import { env } from "../config/env";

export type GenerateProofsResponse = unknown;

export const proofGenerationApi = {
  generateForTransaction(txId: string) {
    return apiClient.post<GenerateProofsResponse>(
      `${env.zkProverBaseUrl}/proofs/generate`,
      { tx_id: txId },
      { timeoutMs: 20000 }
    );
  },
};
