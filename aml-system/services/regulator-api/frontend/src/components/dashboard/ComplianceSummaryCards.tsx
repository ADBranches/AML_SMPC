import { Card } from "../ui/Card";
import { StatusBadge } from "../ui/StatusBadge";

const items = [
  {
    recommendation: "R.10",
    title: "Customer Due Diligence",
    description: "CDD-aligned proof and audit evidence exists and verifies.",
  },
  {
    recommendation: "R.11",
    title: "Record Keeping",
    description: "Transaction, audit, and proof linkage is reconstructable.",
  },
  {
    recommendation: "R.16",
    title: "Payment Transparency / Travel Rule",
    description: "Originator and beneficiary metadata evidence is verified.",
  },
];

export function ComplianceSummaryCards() {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.recommendation}>
          <p className="text-xs font-bold uppercase text-slate-500">{item.recommendation}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
          <div className="mt-4">
            <StatusBadge status="PASSED" />
          </div>
        </Card>
      ))}
    </section>
  );
}
