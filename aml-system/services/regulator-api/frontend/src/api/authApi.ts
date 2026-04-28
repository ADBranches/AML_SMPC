import { apiClient } from "./client";
import { env } from "../config/env";
import type { UserRole } from "../auth/authStore";

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  organization_name: string;
  requested_role: Exclude<UserRole, "super_admin" | "admin">;
  reason_for_access: string;
};

export type RegisterResponse = {
  user_id: string;
  organization_id: string;
  full_name: string;
  email: string;
  requested_role: string;
  account_status: "pending_approval";
  message: string;
};

export const authApi = {
  register(payload: RegisterPayload) {
    return apiClient.post<RegisterResponse>(
      `${env.regulatorApiBaseUrl}/auth/register`,
      payload,
      { timeoutMs: 15000 }
    );
  },
};
