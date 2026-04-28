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

export function PendingUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const rows = await superAdminApi.listPendingUsers();
      setUsers(rows);

      const roleMap: Record<string, string> = {};
      rows.forEach((user) => {
        roleMap[user.user_id] = user.requested_role || user.role || "auditor";
      });
      setSelectedRoles(roleMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pending users.");
    } finally {
      setLoading(false);
    }
  }

  async function runAction(action: () => Promise<unknown>) {
    setNotice("");
    setError("");

    try {
      await action();
      setNotice("Action completed successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending User Approvals"
        description="Approve or reject new registration requests and assign final platform roles."
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
          <h3 className="font-bold">Registration Requests</h3>
          <button onClick={load} className="rounded-xl border px-4 py-2 text-sm font-semibold">
            Refresh
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {users.map((user) => (
            <article key={user.user_id} className="rounded-2xl border p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold">{user.full_name}</h4>
                  <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Organization: <span className="font-semibold">{user.organization_name || "N/A"}</span>
                  </p>
                </div>
                <StatusBadge status={user.account_status} />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Requested Role</p>
                  <p className="mt-1 font-mono text-sm">{user.requested_role || user.role}</p>
                </div>

                <label className="block text-sm font-semibold">
                  Assign Role
                  <select
                    value={selectedRoles[user.user_id] || user.requested_role || user.role}
                    onChange={(event) =>
                      setSelectedRoles((current) => ({
                        ...current,
                        [user.user_id]: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border px-4 py-3"
                  >
                    {assignableRoles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                {user.reason_for_access}
              </div>

              <label className="mt-4 block text-sm font-semibold">
                Rejection Reason
                <input
                  value={rejectReasons[user.user_id] || ""}
                  onChange={(event) =>
                    setRejectReasons((current) => ({
                      ...current,
                      [user.user_id]: event.target.value,
                    }))
                  }
                  placeholder="Optional rejection reason"
                  className="mt-2 w-full rounded-xl border px-4 py-3"
                />
              </label>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    runAction(() =>
                      superAdminApi.approveUser(
                        user.user_id,
                        selectedRoles[user.user_id] || user.requested_role || user.role
                      )
                    )
                  }
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    runAction(() =>
                      superAdminApi.rejectUser(
                        user.user_id,
                        rejectReasons[user.user_id] || "Rejected by super admin."
                      )
                    )
                  }
                  className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
                >
                  Reject
                </button>
              </div>
            </article>
          ))}

          {users.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
              No pending user requests.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
