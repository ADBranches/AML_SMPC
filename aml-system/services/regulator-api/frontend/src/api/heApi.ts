import { apiClient } from "./client";
import { env } from "../config/env";

export type HeEncryptResponse = {
  ciphertext_hex: string;
};

export type HeSumResponse = {
  result_ciphertext_hex: string;
};

export type HeDecryptResponse = {
  amount: number;
};

export const heApi = {
  encrypt(amount: number) {
    return apiClient.post<HeEncryptResponse>(
      `${env.heApiBaseUrl}/he/encrypt`,
      { amount },
      { timeoutMs: 15000 }
    );
  },

  sum(lhsCiphertextHex: string, rhsCiphertextHex: string) {
    return apiClient.post<HeSumResponse>(
      `${env.heApiBaseUrl}/he/sum`,
      {
        lhs_ciphertext_hex: lhsCiphertextHex,
        rhs_ciphertext_hex: rhsCiphertextHex,
      },
      { timeoutMs: 15000 }
    );
  },

  decryptTest(ciphertextHex: string) {
    return apiClient.post<HeDecryptResponse>(
      `${env.heApiBaseUrl}/he/decrypt-test`,
      { ciphertext_hex: ciphertextHex },
      { timeoutMs: 15000 }
    );
  },
};
