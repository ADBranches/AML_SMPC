import { apiClient } from "./client";
import { env } from "../config/env";
import type { HealthResponse } from "../types/health";

const baseUrl = env.regulatorApiBaseUrl;

export const healthApi = {
  check() {
    return apiClient.get<HealthResponse>(`${baseUrl}/health`);
  },
};
