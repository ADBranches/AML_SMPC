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
          AML SMPC Compliance System for Financial Institutions
        </h1>

        <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
          A prototype integrating SMPC, homomorphic encryption, zk proof artifacts,
          audit logging, and regulator-facing compliance verification.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/institution/dashboard" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
            Enter Institution Dashboard
          </Link>
          <Link to="/regulator/dashboard" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold">
            Enter Regulator Dashboard
          </Link>
          <Link to="/admin/dashboard" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold">
            Enter Admin Dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="font-bold">Bank Users</h3>
          <p className="mt-2 text-sm text-slate-600">
            Submit synthetic transactions, trigger pseudonymization, SMPC screening,
            and compliance-proof workflows.
          </p>
        </Card>

        <Card>
          <h3 className="font-bold">Regulators</h3>
          <p className="mt-2 text-sm text-slate-600">
            Review proof metadata, verify proof artifacts, and inspect audit timelines
            without raw customer data exposure.
          </p>
        </Card>

        <Card>
          <h3 className="font-bold">Administrators</h3>
          <p className="mt-2 text-sm text-slate-600">
            Monitor service health, crypto-service readiness, retention controls,
            and evidence status.
          </p>
        </Card>
      </section>
    </div>
  );
}
