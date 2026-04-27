import { apiClient } from "./client";
import { env } from "../config/env";

export type ServiceStatus = {
  name: string;
  url: string;
  status: "ok" | "unavailable";
  payload?: unknown;
  error?: string;
};

async function checkService(name: string, url: string): Promise<ServiceStatus> {
  try {
    const payload = await apiClient.get<unknown>(url, { timeoutMs: 4000 });

    return {
      name,
      url,
      status: "ok",
      payload,
    };
  } catch (err) {
    return {
      name,
      url,
      status: "unavailable",
      error: err instanceof Error ? err.message : "Service unavailable",
    };
  }
}

export const systemApi = {
  async checkAllServices(): Promise<ServiceStatus[]> {
    return Promise.all([
      checkService("regulator-api", `${env.regulatorApiBaseUrl}/health`),
      checkService("encryption-service", `${env.encryptionApiBaseUrl}/health`),
      checkService("he-orchestrator", `${env.heApiBaseUrl}/health`),
      checkService("smpc-orchestrator", `${env.smpcApiBaseUrl}/health`),
      checkService("zk-prover", `${env.zkProverBaseUrl}/health`),
    ]);
  },

  smpcStatus() {
    return apiClient.get<unknown>(`${env.smpcApiBaseUrl}/smpc/status`);
  },
};
