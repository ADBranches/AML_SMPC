import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";

export function AboutPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="About AML SMPC"
        description="A privacy-preserving AML compliance prototype using SMPC, homomorphic encryption, zk proof artifacts, and regulator-facing evidence review."
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-bold text-slate-950">Core Stack</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>MP-SPDZ for secure multi-party computation workflows.</li>
            <li>Microsoft SEAL for homomorphic encryption validation.</li>
            <li>arkworks / Halo2-oriented proof workflows.</li>
            <li>PostgreSQL for transactions, audit logs, and proof storage.</li>
            <li>React + Vite + TypeScript + Tailwind CSS for this regulator console.</li>
          </ul>
        </Card>

        <Card>
          <h3 className="font-bold text-slate-950">Compliance Scope</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Recommendation 10 (R.10) — Customer Due Diligence.</li>
            <li>Recommendation 11 (R.11) — Record Keeping.</li>
            <li>Recommendation 16 (R.16) — Payment Transparency / Travel Rule.</li>
            <li>GDPR-aligned pseudonymization and synthetic-data demo discipline.</li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
