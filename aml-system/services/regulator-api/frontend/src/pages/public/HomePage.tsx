import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";

export function HomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Privacy-Preserving AML Compliance
        </p>

        <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-slate-950">
          AML SMPC Compliance Platform
        </h1>

        <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
          A role-governed AML compliance system for financial institutions,
          regulators, auditors, and administrators. The platform demonstrates
          transaction submission, SMPC screening, HE operations, zk proof
          generation, audit traceability, and regulator verification.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold"
          >
            Request Access
          </Link>

          <Link
            to="/about"
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold"
          >
            About Project
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="font-bold">Institution Users</h3>
          <p className="mt-2 text-sm text-slate-600">
            Submit transactions, request screening, and manage compliance
            workflows after approval.
          </p>
        </Card>

        <Card>
          <h3 className="font-bold">Regulators</h3>
          <p className="mt-2 text-sm text-slate-600">
            Verify proof artifacts and inspect audit evidence without raw
            customer-data exposure.
          </p>
        </Card>

        <Card>
          <h3 className="font-bold">Super Admin</h3>
          <p className="mt-2 text-sm text-slate-600">
            Approve registrations, assign roles, and control platform access.
          </p>
        </Card>
      </section>
    </div>
  );
}
