import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  superAdminApi,
  type AdminUserRow,
  type OrganizationAdminRow,
  type RoleDefinition,
} from "../../api/superAdminApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";

export function SuperAdminDashboardPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationAdminRow[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [userRows, orgRows, roleRows] = await Promise.all([
        superAdminApi.listUsers(),
        superAdminApi.listOrganizations(),
        superAdminApi.listRoles(),
      ]);

      setUsers(userRows);
      setOrganizations(orgRows);
      setRoles(roleRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const pendingUsers = users.filter((user) => user.account_status === "pending_approval").length;
  const activeUsers = users.filter((user) => user.account_status === "active").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Dashboard"
        description="Govern platform access, role boundaries, organizations, approvals, and user lifecycle controls."
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Pending Approvals</p>
          <h3 className="mt-2 text-3xl font-black">{pendingUsers}</h3>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Active Users</p>
          <h3 className="mt-2 text-3xl font-black">{activeUsers}</h3>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Organizations</p>
          <h3 className="mt-2 text-3xl font-black">{organizations.length}</h3>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">RBAC Roles</p>
          <h3 className="mt-2 text-3xl font-black">{roles.length}</h3>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-bold">Pending Users</h3>
          <p className="mt-2 text-sm text-slate-600">
            Review registration requests and assign final roles.
          </p>
          <Link
            to="/super-admin/pending-users"
            className="mt-4 inline-block rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Open Pending Users
          </Link>
        </Card>

        <Card>
          <h3 className="font-bold">User Management</h3>
          <p className="mt-2 text-sm text-slate-600">
            Activate, deactivate, and review role assignments for all users.
          </p>
          <Link
            to="/super-admin/users"
            className="mt-4 inline-block rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Open User Management
          </Link>
        </Card>

        <Card>
          <h3 className="font-bold">Organizations</h3>
          <p className="mt-2 text-sm text-slate-600">
            Inspect organization membership and user-status distribution.
          </p>
          <Link
            to="/super-admin/organizations"
            className="mt-4 inline-block rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Open Organizations
          </Link>
        </Card>

        <Card>
          <h3 className="font-bold">Role Management</h3>
          <p className="mt-2 text-sm text-slate-600">
            Review role definitions and backend permission boundaries.
          </p>
          <Link
            to="/super-admin/roles"
            className="mt-4 inline-block rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Open Roles
          </Link>
        </Card>
      </section>
    </div>
  );
}
