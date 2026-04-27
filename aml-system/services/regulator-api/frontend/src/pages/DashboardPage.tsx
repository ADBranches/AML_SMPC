import { ComplianceSummaryCards } from "../components/dashboard/ComplianceSummaryCards";
import { PhaseStatusGrid } from "../components/dashboard/PhaseStatusGrid";
import { QuickActions } from "../components/dashboard/QuickActions";
import { SystemHealthCard } from "../components/dashboard/SystemHealthCard";
import { PageHeader } from "../components/ui/PageHeader";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Evidence Dashboard"
        description="Executive browser view of backend health, Phase 7 validation status, FATF-aligned compliance evidence, and regulator workflows."
      />

      <SystemHealthCard />
      <PhaseStatusGrid />
      <ComplianceSummaryCards />
      <QuickActions />
    </div>
  );
}
