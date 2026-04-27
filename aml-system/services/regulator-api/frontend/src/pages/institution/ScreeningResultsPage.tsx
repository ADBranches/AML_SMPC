import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function ScreeningResultsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="SMPC Screening Results"
        description="Visible demonstration of privacy-preserving sanction screening results produced during transaction submission."
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold">Sender Screening</h3>
              <p className="mt-2 text-sm text-slate-600">Entity screening is recorded through audit events.</p>
            </div>
            <StatusBadge status="NO_MATCH" />
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold">Receiver Screening</h3>
              <p className="mt-2 text-sm text-slate-600">Entity screening is recorded through audit events.</p>
            </div>
            <StatusBadge status="NO_MATCH" />
          </div>
        </Card>
      </section>

      <Card>
        <h3 className="font-bold">Next Verification Step</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Open the regulator audit page and search the transaction ID to view the actual screening audit records.
        </p>
        <Link to="/regulator/audit" className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          Open Regulator Audit Timeline
        </Link>
      </Card>
    </div>
  );
}
