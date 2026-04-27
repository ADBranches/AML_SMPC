import { apiClient } from "./client";
import { env } from "../config/env";
import type { ProofDetail, ProofRow, VerifyProofResponse } from "../types/proof";

const baseUrl = env.regulatorApiBaseUrl;

export const proofsApi = {
  listByTransaction(txId: string) {
    return apiClient.get<ProofRow[]>(
      `${baseUrl}/proofs?tx_id=${encodeURIComponent(txId)}`
    );
  },

  getProof(proofId: string) {
    return apiClient.get<ProofDetail>(
      `${baseUrl}/proofs/${encodeURIComponent(proofId)}`
    );
  },

  verifyProof(proofId: string) {
    return apiClient.post<VerifyProofResponse>(
      `${baseUrl}/proofs/${encodeURIComponent(proofId)}/verify`
    );
  },
};
