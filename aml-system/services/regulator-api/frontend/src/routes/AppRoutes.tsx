import { Navigate, createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { roleGroups } from "../auth/roleAccess";
import { AppLayout } from "../layouts/AppLayout";

import { HomePage } from "../pages/public/HomePage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { AboutPage } from "../pages/AboutPage";

import { InstitutionDashboardPage } from "../pages/institution/InstitutionDashboardPage";
import { NewTransactionPage } from "../pages/institution/NewTransactionPage";
import { ScreeningResultsPage } from "../pages/institution/ScreeningResultsPage";
import { TransactionReviewQueuePage } from "../pages/institution/TransactionReviewQueuePage";

import { RegulatorDashboardPage } from "../pages/regulator/RegulatorDashboardPage";
import { RegulatorProofsPage } from "../pages/regulator/RegulatorProofsPage";
import { RegulatorAuditPage } from "../pages/regulator/RegulatorAuditPage";
import { RegulatorPerformancePage } from "../pages/regulator/RegulatorPerformancePage";
import { RegulatorComplianceReportPage } from "../pages/regulator/RegulatorComplianceReportPage";

import { SuperAdminDashboardPage } from "../pages/super-admin/SuperAdminDashboardPage";

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
          <ProtectedRoute allowedRoles={roleGroups.institutionManagement}>
            <InstitutionDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "institution/transactions/new",
        element: (
          <ProtectedRoute allowedRoles={roleGroups.transactionSubmission}>
            <NewTransactionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "institution/reviews",
        element: (
          <ProtectedRoute allowedRoles={roleGroups.transactionReview}>
            <TransactionReviewQueuePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "institution/screening-results",
        element: (
          <ProtectedRoute allowedRoles={roleGroups.transactionReview}>
            <ScreeningResultsPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "regulator/dashboard",
        element: (
          <ProtectedRoute allowedRoles={roleGroups.regulatorFull}>
            <RegulatorDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "regulator/proofs",
        element: (
          <ProtectedRoute allowedRoles={roleGroups.regulatorEvidenceReadOnly}>
            <RegulatorProofsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "regulator/audit",
        element: (
          <ProtectedRoute allowedRoles={roleGroups.regulatorEvidenceReadOnly}>
            <RegulatorAuditPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "regulator/performance",
        element: (
          <ProtectedRoute allowedRoles={roleGroups.regulatorFull}>
            <RegulatorPerformancePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "regulator/compliance-report",
        element: (
          <ProtectedRoute allowedRoles={roleGroups.regulatorEvidenceReadOnly}>
            <RegulatorComplianceReportPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "super-admin/dashboard",
        element: (
          <ProtectedRoute allowedRoles={roleGroups.superAdmin}>
            <SuperAdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "super-admin/users",
        element: (
          <ProtectedRoute allowedRoles={roleGroups.superAdmin}>
            <SuperAdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "super-admin/pending-users",
        element: (
          <ProtectedRoute allowedRoles={roleGroups.superAdmin}>
            <SuperAdminDashboardPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "admin/*",
        element: (
          <ProtectedRoute allowedRoles={roleGroups.superAdmin}>
            <Navigate to="/super-admin/dashboard" replace />
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
