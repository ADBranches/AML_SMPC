import { useEffect, useState } from "react";
import { superAdminApi, type AdminUserRow } from "../../api/superAdminApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

const assignableRoles = [
  "institution_admin",
  "transaction_submitter",
  "transaction_reviewer",
  "regulator",
  "auditor",
];

export function UserManagementPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const rows = await superAdminApi.listUsers();
      setUsers(rows);

      const roles: Record<string, string> = {};
      rows.forEach((user) => {
        roles[user.user_id] = user.role;
      });
      setRoleMap(roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  async function runAction(action: () => Promise<unknown>) {
    setNotice("");
    setError("");

    try {
      await action();
      setNotice("User action completed successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "User action failed.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner User Management"
        description="Manage active, disabled, rejected, and pending users with partner-bank identity visibility."
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      {notice ? (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-700">
          {notice}
        </div>
      ) : null}

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold">All Users</h3>
          <button onClick={load} className="rounded-xl border px-4 py-2 text-sm font-semibold">
            Refresh
          </button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Partner Organization</th>
                <th className="px-4 py-3">Employee Identity</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id} className="border-t align-top">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{user.full_name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{user.organization_name || "N/A"}</div>
                    <div className="font-mono text-xs text-slate-500">{user.bank_code || "N/A"}</div>
                    <div className="text-xs text-slate-500">{user.organization_type || "N/A"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs">{user.bank_employee_id || "N/A"}</div>
                    <div className="text-xs text-slate-500">{user.department || "N/A"}</div>
                    <div className="text-xs text-slate-500">{user.job_title || "N/A"}</div>
                  </td>
                  <td className="px-4 py-3">
                    {user.role === "super_admin" ? (
                      <span className="font-mono text-xs">{user.role}</span>
                    ) : (
                      <select
                        value={roleMap[user.user_id] || user.role}
                        onChange={(event) =>
                          setRoleMap((current) => ({
                            ...current,
                            [user.user_id]: event.target.value,
                          }))
                        }
                        className="rounded-xl border px-3 py-2 text-xs"
                      >
                        {assignableRoles.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      Identity: <span className="font-bold">{user.identity_verified ? "Verified" : "Pending"}</span>
                    </div>
                    <div className="text-xs">
                      Partner Scope:{" "}
                      <span className="font-bold">{user.approved_partner_scope ? "Approved" : "Pending"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.account_status} />
                  </td>
                  <td className="space-x-2 px-4 py-3">
                    {user.role !== "super_admin" ? (
                      <>
                        <button
                          onClick={() =>
                            runAction(() =>
                              superAdminApi.activateUser(
                                user.user_id,
                                roleMap[user.user_id] || user.role
                              )
                            )
                          }
                          className="rounded-lg border px-3 py-2 text-xs font-semibold"
                        >
                          Activate / Assign
                        </button>

                        <button
                          onClick={() => runAction(() => superAdminApi.deactivateUser(user.user_id))}
                          className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700"
                        >
                          Deactivate
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
