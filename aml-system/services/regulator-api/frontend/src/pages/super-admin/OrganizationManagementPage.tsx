import { useEffect, useState } from "react";
import { superAdminApi, type OrganizationAdminRow } from "../../api/superAdminApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function OrganizationManagementPage() {
  const [organizations, setOrganizations] = useState<OrganizationAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      setOrganizations(await superAdminApi.listOrganizations());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load organizations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Management"
        description="Inspect participating institutions, regulator bodies, audit offices, and platform administration organizations."
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Organizations</p>
          <h3 className="mt-2 text-3xl font-black">{organizations.length}</h3>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Active Users</p>
          <h3 className="mt-2 text-3xl font-black">
            {organizations.reduce((total, org) => total + org.active_users, 0)}
          </h3>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Pending Users</p>
          <h3 className="mt-2 text-3xl font-black">
            {organizations.reduce((total, org) => total + org.pending_users, 0)}
          </h3>
        </Card>
      </section>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold">Organizations</h3>
          <button onClick={load} className="rounded-xl border px-4 py-2 text-sm font-semibold">
            Refresh
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {organizations.map((org) => (
            <article key={org.organization_id} className="rounded-2xl border p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold">{org.organization_name}</h4>
                  <p className="mt-1 font-mono text-xs text-slate-500">{org.organization_id}</p>
                </div>
                <StatusBadge status={org.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="font-bold">{org.total_users}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Active</p>
                  <p className="font-bold">{org.active_users}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Pending</p>
                  <p className="font-bold">{org.pending_users}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
