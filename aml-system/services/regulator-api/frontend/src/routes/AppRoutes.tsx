import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { ProofsPage } from "../pages/ProofsPage";
import { ProofDetailPage } from "../pages/ProofDetailPage";
import { AuditPage } from "../pages/AuditPage";
import { PerformancePage } from "../pages/PerformancePage";
import { AboutPage } from "../pages/AboutPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "proofs", element: <ProofsPage /> },
      { path: "proofs/:proofId", element: <ProofDetailPage /> },
      { path: "audit", element: <AuditPage /> },
      { path: "performance", element: <PerformancePage /> },
      { path: "about", element: <AboutPage /> },
    ],
  },
]);
