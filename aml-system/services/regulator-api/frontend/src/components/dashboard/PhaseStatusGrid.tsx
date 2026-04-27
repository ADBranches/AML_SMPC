import { Card } from "../ui/Card";
import { StatusBadge } from "../ui/StatusBadge";

const phases = [
  {
    phase: "Phase 7.1",
    title: "Functional Testing",
    status: "PASSED",
    description: "HE, SMPC, zk proof generation, and end-to-end API flow validated.",
  },
  {
    phase: "Phase 7.2",
    title: "Performance Testing",
    status: "PASSED",
    description: "Transaction throughput and proof latency passed strict verifier criteria.",
  },
  {
    phase: "Phase 7.3",
    title: "Compliance Validation",
    status: "PASSED",
    description: "R.10, R.11, and R.16 compliance evidence verified.",
  },
];

export function PhaseStatusGrid() {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {phases.map((phase) => (
        <Card key={phase.phase}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">{phase.phase}</p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">{phase.title}</h3>
            </div>
            <StatusBadge status={phase.status} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{phase.description}</p>
        </Card>
      ))}
    </section>
  );
}
