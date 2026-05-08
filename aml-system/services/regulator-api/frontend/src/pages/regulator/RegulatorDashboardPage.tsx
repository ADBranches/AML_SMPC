import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  regulatorDashboardApi,
  type RegulatorDashboardSummary,
} from "../../api/regulatorDashboardApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

const initialSummary: RegulatorDashboardSummary = {
  proofs: [],
  cases: [],
  verifiedProofs: 0,
  pendingProofReviews: 0,
  highRiskCases: 0,
  openAnomalyCases: 0,
  closedAnomalyCases: 0,
  fatfRec10Evidence: 0,
  fatfRec11Evidence: 0,
  fatfRec16Evidence: 0,
};

export function RegulatorDashboardPage() {
  const [summary, setSummary] = useState<RegulatorDashboardSummary>(initialSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      setSummary(await regulatorDashboardApi.summary());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load regulator dashboard summary."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulator Evidence Governance Dashboard"
        description="Regulator view of proofs, audit-facing evidence, compliance coverage, SMPC collaboration, and anomaly case governance without raw bank input exposure."
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Verified Proofs" value={summary.verifiedProofs} to="/regulator/proofs" />
        <MetricCard label="Pending Proof Reviews" value={summary.pendingProofReviews} to="/regulator/proofs" />
        <MetricCard label="High-Risk Cases" value={summary.highRiskCases} to="/regulator/anomaly-cases" />
        <MetricCard label="Open Anomaly Cases" value={summary.openAnomalyCases} to="/regulator/anomaly-cases" />
        <MetricCard label="Closed Anomaly Cases" value={summary.closedAnomalyCases} to="/regulator/anomaly-cases" />
        <MetricCard label="FATF R.10 Evidence" value={summary.fatfRec10Evidence} to="/regulator/compliance-report" />
        <MetricCard label="FATF R.11 Evidence" value={summary.fatfRec11Evidence} to="/regulator/compliance-report" />
        <MetricCard label="FATF R.16 Evidence" value={summary.fatfRec16Evidence} to="/regulator/compliance-report" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold">Evidence Governance Routes</h3>
            <button onClick={load} className="rounded-xl border px-4 py-2 text-sm font-semibold">
              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <RouteCard title="Proof Verification" to="/regulator/proofs" />
            <RouteCard title="Audit Evidence" to="/regulator/audit" />
            <RouteCard title="Compliance Report" to="/regulator/compliance-report" />
            <RouteCard title="Three-Bank SMPC Demo" to="/regulator/three-bank-smpc-demo" />
            <RouteCard title="Anomaly Cases" to="/regulator/anomaly-cases" />
          </div>
        </Card>

        <Card>
          <h3 className="font-bold">Privacy Boundary</h3>
          <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            The regulator sees proof status, risk level, case references, FATF evidence coverage,
            audit summaries, and aggregate SMPC evidence. The regulator does not receive raw
            customer account data from other banks.
          </div>

          <div className="mt-4 grid gap-3">
            <EvidenceFact label="Raw bank inputs disclosed" value="false" />
            <EvidenceFact label="Bank identifies suspicion first" value="true" />
            <EvidenceFact label="Regulator verifies evidence" value="true" />
            <EvidenceFact label="Banks receive scoped feedback" value="true" />
          </div>
        </Card>
      </section>

      <Card>
        <h3 className="font-bold">Recent Anomaly Cases</h3>

        <div className="mt-5 overflow-x-auto rounded-2xl border">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Case</th>
                <th className="px-4 py-3">Transaction</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Banks Notified</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {summary.cases.slice(0, 8).map((item) => (
                <tr key={item.id} className="border-t align-top">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-bold">{item.case_ref}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.summary}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{item.tx_id}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.risk_level} /></td>
                  <td className="px-4 py-3"><StatusBadge status={item.case_status} /></td>
                  <td className="px-4 py-3">{item.bank_notices.length}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/regulator/anomaly-cases/${item.id}`}
                      className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {summary.cases.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed p-6 text-sm text-slate-500">
            No anomaly cases yet. Open a case from `/regulator/anomaly-cases`.
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function MetricCard({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Card>
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <h3 className="mt-2 text-3xl font-black">{value}</h3>
      <Link to={to} className="mt-3 inline-block text-xs font-semibold text-slate-700">
        Open
      </Link>
    </Card>
  );
}

function RouteCard({ title, to }: { title: string; to: string }) {
  return (
    <Link to={to} className="rounded-2xl border p-4 text-sm font-bold hover:bg-slate-50">
      {title}
    </Link>
  );
}

function EvidenceFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-3 text-sm">
      <span className="font-semibold text-slate-600">{label}</span>
      <span className="font-mono text-xs font-bold">{value}</span>
    </div>
  );
}
