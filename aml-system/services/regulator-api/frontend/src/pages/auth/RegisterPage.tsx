import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { authApi, type RegisterPayload, type RegisterResponse } from "../../api/authApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { JsonViewer } from "../../components/ui/JsonViewer";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";

const initialPayload: RegisterPayload = {
  full_name: "",
  email: "",
  password: "",
  partner_bank_code: "BANK_A_UG",
  bank_employee_id: "",
  department: "",
  job_title: "",
  requested_role: "transaction_submitter",
  reason_for_access: "",
};

export function RegisterPage() {
  const [payload, setPayload] = useState<RegisterPayload>(initialPayload);
  const [response, setResponse] = useState<RegisterResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof RegisterPayload>(
    key: K,
    value: RegisterPayload[K]
  ) {
    setPayload((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const result = await authApi.register(payload);
      setResponse(result);
      setPayload(initialPayload);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Confirm backend services are running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Request Partner Access"
        description="Register under an approved partner bank, regulator authority, auditor body, or platform organization. Your account remains pending until a super admin approves it."
      />

      <Card>
        <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          <p className="font-bold">Partner organization codes for demo testing</p>
          <p className="mt-1 font-mono text-xs">
            BANK_A_UG, BANK_B_KE, BANK_C_TZ, DEMO_ORIGIN_BANK, DEMO_BENEFICIARY_BANK,
            REGULATOR_AUTHORITY, AUDITOR_BODY
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold">
            Full Name
            <input
              value={payload.full_name}
              onChange={(event) => update("full_name", event.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3"
              required
            />
          </label>

          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              value={payload.email}
              onChange={(event) => update("email", event.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3"
              required
            />
          </label>

          <label className="block text-sm font-semibold">
            Password
            <input
              type="password"
              value={payload.password}
              onChange={(event) => update("password", event.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3"
              minLength={8}
              required
            />
          </label>

          <label className="block text-sm font-semibold">
            Partner Bank / Organization Code
            <input
              value={payload.partner_bank_code}
              onChange={(event) => update("partner_bank_code", event.target.value.toUpperCase())}
              className="mt-2 w-full rounded-xl border px-4 py-3 font-mono"
              placeholder="BANK_A_UG"
              required
            />
          </label>

          <label className="block text-sm font-semibold">
            Bank Employee ID
            <input
              value={payload.bank_employee_id}
              onChange={(event) => update("bank_employee_id", event.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3"
              placeholder="EMP-001"
              required
            />
          </label>

          <label className="block text-sm font-semibold">
            Department
            <input
              value={payload.department}
              onChange={(event) => update("department", event.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3"
              placeholder="Compliance"
              required
            />
          </label>

          <label className="block text-sm font-semibold">
            Job Title
            <input
              value={payload.job_title}
              onChange={(event) => update("job_title", event.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3"
              placeholder="AML Analyst"
              required
            />
          </label>

          <label className="block text-sm font-semibold">
            Requested Role
            <select
              value={payload.requested_role}
              onChange={(event) =>
                update(
                  "requested_role",
                  event.target.value as RegisterPayload["requested_role"]
                )
              }
              className="mt-2 w-full rounded-xl border px-4 py-3"
            >
              <option value="institution_admin">Institution Admin</option>
              <option value="transaction_submitter">Transaction Submitter</option>
              <option value="transaction_reviewer">Transaction Reviewer</option>
              <option value="regulator">Regulator</option>
              <option value="auditor">Auditor</option>
            </select>
          </label>

          <label className="block text-sm font-semibold md:col-span-2">
            Reason for Access
            <textarea
              value={payload.reason_for_access}
              onChange={(event) => update("reason_for_access", event.target.value)}
              className="mt-2 min-h-28 w-full rounded-xl border px-4 py-3"
              minLength={10}
              required
            />
          </label>

          <div className="md:col-span-2">
            <button
              disabled={loading}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Partner Access Request"}
            </button>
          </div>
        </form>

        {loading ? <div className="mt-4"><LoadingState /></div> : null}
        {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}

        {response ? (
          <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
            <h3 className="font-bold text-emerald-800">
              Registration submitted successfully
            </h3>
            <p className="mt-2 text-sm text-emerald-700">
              Your request was submitted under{" "}
              <span className="font-bold">{response.organization_name}</span>{" "}
              using partner code{" "}
              <span className="font-mono font-bold">{response.partner_bank_code}</span>.
              Your account status is{" "}
              <span className="font-bold">{response.account_status}</span>.
            </p>

            <div className="mt-4">
              <JsonViewer value={response} />
            </div>
          </div>
        ) : null}

        <p className="mt-4 text-sm text-slate-600">
          Already approved?{" "}
          <Link to="/login" className="font-semibold text-slate-950">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
