import { useEffect, useState } from "react";

export type UserRole =
  | "super_admin"
  | "admin"
  | "institution_admin"
  | "transaction_submitter"
  | "transaction_reviewer"
  | "regulator"
  | "auditor";

export type AccountStatus = "pending_approval" | "active" | "disabled";

export type AuthSession = {
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  account_status: AccountStatus;
  organization_name?: string;
  token?: string;
};

const STORAGE_KEY = "aml_smpc_auth_session";

export function getStoredSession(): AuthSession | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setStoredSession(session: AuthSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("aml-smpc-auth-change"));
}

export function clearStoredSession() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("aml-smpc-auth-change"));
}

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(() =>
    getStoredSession()
  );

  useEffect(() => {
    function syncSession() {
      setSession(getStoredSession());
    }

    window.addEventListener("storage", syncSession);
    window.addEventListener("aml-smpc-auth-change", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("aml-smpc-auth-change", syncSession);
    };
  }, []);

  return session;
}
