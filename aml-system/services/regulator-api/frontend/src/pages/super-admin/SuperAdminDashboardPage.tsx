import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";

export function SuperAdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Dashboard"
        description="Approval, user-management, organization-management, and RBAC assignment dashboard."
      />

      <Card>
        <h3 className="font-bold">Pending Implementation</h3>
        <p className="mt-2 text-sm text-slate-600">
          The next phase will connect this dashboard to pending registrations,
          role approvals, user activation/deactivation, and organization control.
        </p>
      </Card>
    </div>
  );
}
