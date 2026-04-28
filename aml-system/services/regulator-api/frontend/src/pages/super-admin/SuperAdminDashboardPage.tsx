import { useEffect, useState } from "react";
import {
  superAdminApi,
  type AdminUserRow,
} from "../../api/superAdminApi";
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

export function SuperAdminDashboardPage() {
  const [pendingUsers, setPendingUsers] = useState<AdminUserRow[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUserRow[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [pending, users] = await Promise.all([
        superAdminApi.listPendingUsers(),
        superAdminApi.listUsers(),
      ]);

      setPendingUsers(pending);
      setAllUsers(users);

      const roles: Record<string, string> = {};
      pending.forEach((user) => {
        roles[user.user_id] = user.requested_role || user.role || "auditor";
      });
      users.forEach((user) => {
        roles[user.user_id] = user.requested_role || user.role || "auditor";
      });
      setSelectedRoles(roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function runAction(label: string, action: () => Promise<unknown>) {
    setActionLoading(label);
    setError("");
    setNotice("");

    try {
      await action();
      setNotice("Action completed successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionLoading("");
    }
  }

  function setRole(userId: string, role: string) {
    setSelectedRoles((current) => ({ ...current, [userId]: role }));
  }

  function setRejectReason(userId: string, reason: string) {
    setRejectReasons((current) => ({ ...current, [userId]: reason }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Dashboard"
        description="Approve registrations, assign roles, reject requests, activate/deactivate users, and govern platform access."
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      {notice ? (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-700">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Pending Users</p>
          <h3 className="mt-2 text-3xl font-black">{pendingUsers.length}</h3>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">All Users</p>
          <h3 className="mt-2 text-3xl font-black">{allUsers.length}</h3>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Active Users</p>
          <h3 className="mt-2 text-3xl font-black">
            {allUsers.filter((user) => user.account_status === "active").length}
          </h3>
        </Card>
      </section>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Pending Registration Requests</h3>
            <p className="mt-1 text-sm text-slate-600">
              Review requested roles, organization details, and reasons for access.
            </p>
          </div>

          <button
            onClick={load}
            className="rounded-xl border px-4 py-2 text-sm font-semibold"
          >
            Refresh
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {pendingUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed p-5 text-sm text-slate-500">
              No pending registration requests.
            </div>
          ) : null}

          {pendingUsers.map((user) => (
            <article
              key={user.user_id}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold">{user.full_name}</h4>
                  <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Organization:{" "}
                    <span className="font-semibold">
                      {user.organization_name || "N/A"}
                    </span>
                  </p>
                </div>

                <StatusBadge status={user.account_status} />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Requested Role
                  </p>
                  <p className="mt-1 font-mono text-sm">
                    {user.requested_role || user.role}
                  </p>
                </div>

                <label className="block text-sm font-semibold">
                  Assign Role
                  <select
                    value={selectedRoles[user.user_id] || user.requested_role || user.role}
                    onChange={(event) => setRole(user.user_id, event.target.value)}
                    className="mt-2 w-full rounded-xl border px-4 py-3"
                  >
                    {assignableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Reason for Access
                </p>
                <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {user.reason_for_access}
                </p>
              </div>

              <label className="mt-4 block text-sm font-semibold">
                Rejection Reason
                <input
                  value={rejectReasons[user.user_id] || ""}
                  onChange={(event) =>
                    setRejectReason(user.user_id, event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border px-4 py-3"
                  placeholder="Optional rejection note"
                />
              </label>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  disabled={actionLoading === user.user_id}
                  onClick={() =>
                    runAction(user.user_id, () =>
                      superAdminApi.approveUser(
                        user.user_id,
                        selectedRoles[user.user_id] ||
                          user.requested_role ||
                          user.role
                      )
                    )
                  }
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Approve User
                </button>

                <button
                  disabled={actionLoading === user.user_id}
                  onClick={() =>
                    runAction(user.user_id, () =>
                      superAdminApi.rejectUser(
                        user.user_id,
                        rejectReasons[user.user_id] ||
                          "Rejected by super admin."
                      )
                    )
                  }
                  className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
                >
                  Reject User
                </button>
              </div>
            </article>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold">User Management</h3>
        <p className="mt-1 text-sm text-slate-600">
          Activate or deactivate existing users. Super admin accounts are protected from deactivation.
        </p>

        <div className="mt-5 overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {allUsers.map((user) => (
                <tr key={user.user_id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{user.full_name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">{user.organization_name || "N/A"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{user.role}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.account_status} />
                  </td>
                  <td className="space-x-2 px-4 py-3">
                    <button
                      onClick={() =>
                        runAction(user.user_id, () =>
                          superAdminApi.activateUser(
                            user.user_id,
                            selectedRoles[user.user_id] || user.role
                          )
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-xs font-semibold"
                    >
                      Activate
                    </button>

                    <button
                      onClick={() =>
                        runAction(user.user_id, () =>
                          superAdminApi.deactivateUser(user.user_id)
                        )
                      }
                      className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700"
                    >
                      Deactivate
                    </button>
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
