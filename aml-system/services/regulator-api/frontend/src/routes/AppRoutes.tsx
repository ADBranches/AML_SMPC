import { Navigate, createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { AppLayout } from "../layouts/AppLayout";

import { HomePage } from "../pages/public/HomePage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { AboutPage } from "../pages/AboutPage";

import { InstitutionDashboardPage } from "../pages/institution/InstitutionDashboardPage";
import { NewTransactionPage } from "../pages/institution/NewTransactionPage";
import { ScreeningResultsPage } from "../pages/institution/ScreeningResultsPage";

import { RegulatorDashboardPage } from "../pages/regulator/RegulatorDashboardPage";
import { RegulatorProofsPage } from "../pages/regulator/RegulatorProofsPage";
import { RegulatorAuditPage } from "../pages/regulator/RegulatorAuditPage";
import { RegulatorPerformancePage } from "../pages/regulator/RegulatorPerformancePage";
import { RegulatorComplianceReportPage } from "../pages/regulator/RegulatorComplianceReportPage";

import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminServicesPage } from "../pages/admin/AdminServicesPage";
import { AdminRetentionPage } from "../pages/admin/AdminRetentionPage";

import { SuperAdminDashboardPage } from "../pages/super-admin/SuperAdminDashboardPage";

const institutionRoles = [
  "institution_admin",
  "transaction_submitter",
  "transaction_reviewer",
] as const;

const regulatorRoles = ["regulator", "auditor"] as const;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },

      {
        path: "institution/dashboard",
        element: (
          <ProtectedRoute allowedRoles={[...institutionRoles]}>
            <InstitutionDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "institution/transactions/new",
        element: (
          <ProtectedRoute allowedRoles={[...institutionRoles]}>
            <NewTransactionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "institution/screening-results",
        element: (
          <ProtectedRoute allowedRoles={[...institutionRoles]}>
            <ScreeningResultsPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "regulator/dashboard",
        element: (
          <ProtectedRoute allowedRoles={[...regulatorRoles]}>
            <RegulatorDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "regulator/proofs",
        element: (
          <ProtectedRoute allowedRoles={[...regulatorRoles]}>
            <RegulatorProofsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "regulator/audit",
        element: (
          <ProtectedRoute allowedRoles={[...regulatorRoles]}>
            <RegulatorAuditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "regulator/performance",
        element: (
          <ProtectedRoute allowedRoles={[...regulatorRoles]}>
            <RegulatorPerformancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "regulator/compliance-report",
        element: (
          <ProtectedRoute allowedRoles={[...regulatorRoles]}>
            <RegulatorComplianceReportPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "admin/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/services",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminServicesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/retention",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminRetentionPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "super-admin/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminDashboardPage />
          </ProtectedRoute>
        ),
      },

      { path: "dashboard", element: <Navigate to="/login" replace /> },
      { path: "proofs", element: <Navigate to="/login" replace /> },
      { path: "audit", element: <Navigate to="/login" replace /> },
      { path: "performance", element: <Navigate to="/login" replace /> },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
