import { Link } from "react-router-dom";
import { Card } from "../ui/Card";

const actions = [
  { to: "/proofs", title: "Review Proofs", description: "Search, inspect, and verify proof artifacts." },
  { to: "/audit", title: "View Audit Timeline", description: "Reconstruct compliance event history." },
  { to: "/performance", title: "Open Performance Evidence", description: "View throughput and proof latency evidence." },
];

export function QuickActions() {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {actions.map((action) => (
        <Link key={action.to} to={action.to}>
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="font-bold text-slate-950">{action.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
          </Card>
        </Link>
      ))}
    </section>
  );
}
