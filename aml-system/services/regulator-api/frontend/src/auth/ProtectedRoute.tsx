import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { dashboardForRole } from "./roleAccess";
import { useAuthSession, type UserRole } from "./authStore";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles: UserRole[];
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const session = useAuthSession();
  const location = useLocation();

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ returnTo: location.pathname }}
      />
    );
  }

  if (session.account_status !== "active") {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(session.role)) {
    return <Navigate to={dashboardForRole(session.role)} replace />;
  }

  return <>{children}</>;
}
