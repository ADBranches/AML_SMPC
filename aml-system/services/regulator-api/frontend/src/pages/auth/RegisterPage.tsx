import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";

export function RegisterPage() {
  const [message, setMessage] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    setMessage(
      "Registration approval workflow is the next backend phase. Submitted users will become pending_approval until super admin approval."
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Request Access"
        description="Register your organization and requested role. A super admin will approve or reject the request."
      />

      <Card>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold">
            Full Name
            <input className="mt-2 w-full rounded-xl border px-4 py-3" />
          </label>

          <label className="block text-sm font-semibold">
            Email
            <input type="email" className="mt-2 w-full rounded-xl border px-4 py-3" />
          </label>

          <label className="block text-sm font-semibold">
            Organization
            <input className="mt-2 w-full rounded-xl border px-4 py-3" />
          </label>

          <label className="block text-sm font-semibold">
            Requested Role
            <select className="mt-2 w-full rounded-xl border px-4 py-3">
              <option value="institution_admin">Institution Admin</option>
              <option value="transaction_submitter">Transaction Submitter</option>
              <option value="transaction_reviewer">Transaction Reviewer</option>
              <option value="regulator">Regulator</option>
              <option value="auditor">Auditor</option>
            </select>
          </label>

          <label className="block text-sm font-semibold md:col-span-2">
            Reason for Access
            <textarea className="mt-2 min-h-28 w-full rounded-xl border px-4 py-3" />
          </label>

          <div className="md:col-span-2">
            <button className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
              Submit Registration Request
            </button>
          </div>
        </form>

        {message ? (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            {message}
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
