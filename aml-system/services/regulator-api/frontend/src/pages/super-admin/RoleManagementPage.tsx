import { useEffect, useState } from "react";
import { superAdminApi, type RoleDefinition } from "../../api/superAdminApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";

export function RoleManagementPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      setRoles(await superAdminApi.listRoles());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roles.");
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
        title="Role Management"
        description="Review enterprise RBAC role boundaries and backend permission claims used in JWT sessions."
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <section className="grid gap-4 lg:grid-cols-2">
        {roles.map((role) => (
          <Card key={role.role}>
            <p className="text-xs font-bold uppercase text-slate-500">Role</p>
            <h3 className="mt-2 font-mono text-lg font-black">{role.role}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{role.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {role.permissions.map((permission) => (
                <span
                  key={permission}
                  className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {permission}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
