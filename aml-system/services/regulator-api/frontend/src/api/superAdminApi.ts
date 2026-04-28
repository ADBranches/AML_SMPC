import { ApiError } from "./client";
import { env } from "../config/env";
import { getStoredSession } from "../auth/authStore";

export type AdminUserRow = {
  user_id: string;
  organization_id: string | null;
  organization_name: string | null;
  full_name: string;
  email: string;
  role: string;
  account_status: string;
  requested_role: string | null;
  approval_status: string | null;
  reason_for_access: string;
  created_at: string;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getStoredSession();

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  const response = await fetch(`${env.regulatorApiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Request failed with HTTP ${response.status}`;

    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
}

export const superAdminApi = {
  listPendingUsers() {
    return request<AdminUserRow[]>("/admin/users/pending");
  },

  listUsers() {
    return request<AdminUserRow[]>("/admin/users");
  },

  approveUser(userId: string, assignedRole: string) {
    return request(`/admin/users/${userId}/approve`, {
      method: "POST",
      body: JSON.stringify({ assigned_role: assignedRole }),
    });
  },

  rejectUser(userId: string, reason: string) {
    return request(`/admin/users/${userId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  activateUser(userId: string, assignedRole: string) {
    return request(`/admin/users/${userId}/activate`, {
      method: "POST",
      body: JSON.stringify({ assigned_role: assignedRole }),
    });
  },

  deactivateUser(userId: string) {
    return request(`/admin/users/${userId}/deactivate`, {
      method: "POST",
    });
  },
};
