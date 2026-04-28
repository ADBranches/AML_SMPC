import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";

import { HomePage } from "../pages/public/HomePage";
import { AboutPage } from "../pages/AboutPage";

import { InstitutionDashboardPage } from "../pages/institution/InstitutionDashboardPage";
import { NewTransactionPage } from "../pages/institution/NewTransactionPage";
import { ScreeningResultsPage } from "../pages/institution/ScreeningResultsPage";
import { ComplianceWorkflowPage } from "../pages/institution/ComplianceWorkflowPage";
import { HeOperationsPage } from "../pages/institution/HeOperationsPage";

import { RegulatorDashboardPage } from "../pages/regulator/RegulatorDashboardPage";
import { RegulatorProofsPage } from "../pages/regulator/RegulatorProofsPage";
import { RegulatorAuditPage } from "../pages/regulator/RegulatorAuditPage";
import { RegulatorPerformancePage } from "../pages/regulator/RegulatorPerformancePage";
import { RegulatorComplianceReportPage } from "../pages/regulator/RegulatorComplianceReportPage";

import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminServicesPage } from "../pages/admin/AdminServicesPage";
import { AdminRetentionPage } from "../pages/admin/AdminRetentionPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "home", element: <HomePage /> },
      { path: "about", element: <AboutPage /> },

      { path: "dashboard", element: <Navigate to="/regulator/dashboard" replace /> },
      { path: "proofs", element: <Navigate to="/regulator/proofs" replace /> },
      { path: "audit", element: <Navigate to="/regulator/audit" replace /> },
      { path: "performance", element: <Navigate to="/regulator/performance" replace /> },

      { path: "institution/dashboard", element: <InstitutionDashboardPage /> },
      { path: "institution/transactions/new", element: <NewTransactionPage /> },
      { path: "institution/screening-results", element: <ScreeningResultsPage /> },
      { path: "institution/compliance-workflow", element: <ComplianceWorkflowPage /> },
      { path: "institution/he-operations", element: <HeOperationsPage /> },

      { path: "regulator/dashboard", element: <RegulatorDashboardPage /> },
      { path: "regulator/proofs", element: <RegulatorProofsPage /> },
      { path: "regulator/audit", element: <RegulatorAuditPage /> },
      { path: "regulator/performance", element: <RegulatorPerformancePage /> },
      { path: "regulator/compliance-report", element: <RegulatorComplianceReportPage /> },

      { path: "admin/dashboard", element: <AdminDashboardPage /> },
      { path: "admin/services", element: <AdminServicesPage /> },
      { path: "admin/retention", element: <AdminRetentionPage /> },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
