import { apiClient } from "./client";
import { env } from "../config/env";
import type { AuditEvent } from "../types/audit";

const baseUrl = env.regulatorApiBaseUrl;

export const auditApi = {
  listByTransaction(txId: string) {
    return apiClient.get<AuditEvent[]>(
      `${baseUrl}/audit/${encodeURIComponent(txId)}`
    );
  },
};
