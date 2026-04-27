import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

const services = [
  { name: "encryption-service", port: "8081", status: "OK" },
  { name: "smpc-orchestrator", port: "8083", status: "CHECK_ROUTE" },
  { name: "he-orchestrator", port: "8082", status: "NEEDS_STARTUP" },
  { name: "zk-prover", port: "8084", status: "OK" },
  { name: "regulator-api", port: "8085", status: "OK" },
];

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin/System Operations Dashboard"
        description="Operational view for service health, crypto-service readiness, retention status, and demo evidence readiness."
      />

      <section className="grid gap-4 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.name}>
            <p className="text-xs font-bold uppercase text-slate-500">Port {service.port}</p>
            <h3 className="mt-1 font-bold">{service.name}</h3>
            <div className="mt-4">
              <StatusBadge status={service.status} />
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-bold">SoftHSM / Key Management</h3>
          <p className="mt-2 text-sm text-slate-600">
            Project expectation: SoftHSM supports software-based key management. UI status endpoint still needs backend exposure.
          </p>
          <div className="mt-4"><StatusBadge status="MVP_VISIBILITY_PENDING" /></div>
        </Card>

        <Card>
          <h3 className="font-bold">GDPR Retention</h3>
          <p className="mt-2 text-sm text-slate-600">
            Retention policies are documented/configured. Automated purge runner should be exposed separately before production claims.
          </p>
          <div className="mt-4"><StatusBadge status="CONFIGURED_MVP" /></div>
        </Card>
      </section>
    </div>
  );
}
