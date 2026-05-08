import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { anomalyCasesApi, type BankAnomalyNotice } from "../../api/anomalyCasesApi";
import { riskEvaluationApi, type TransactionWorkflow } from "../../api/riskEvaluationApi";
import { useAuthSession } from "../../auth/authStore";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function InstitutionDashboardPage() {
  const session = useAuthSession();
  const [transactions, setTransactions] = useState<TransactionWorkflow[]>([]);
  const [notices, setNotices] = useState<BankAnomalyNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const txRows = await riskEvaluationApi.listTransactions();
      setTransactions(txRows);

      if (session?.role === "institution_admin" || session?.role === "transaction_reviewer") {
        setNotices(await anomalyCasesApi.listBankNotices());
      } else {
        setNotices([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load institution dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [session?.role]);

  const metrics = useMemo(() => {
    return {
      submitted: transactions.filter((tx) => tx.status === "submitted").length,
      underReview: transactions.filter((tx) => tx.status === "under_review" || tx.status === "approved").length,
      suspicious: transactions.filter((tx) => tx.suspicion_status === "suspicious").length,
      proofGenerated: transactions.filter((tx) => tx.status === "proof_generated").length,
      openNotices: notices.filter((notice) => !["responded", "closed"].includes(notice.notice_status)).length,
      highRisk: transactions.filter((tx) => tx.risk_level === "high").length,
    };
  }, [transactions, notices]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution Dashboard"
        description="Partner-bank scoped workflow summary using live backend transaction, risk, screening, and anomaly notice data."
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Submitted" value={metrics.submitted} to="/institution/transactions" />
        <MetricCard label="Under Review" value={metrics.underReview} to="/institution/transactions" />
        <MetricCard label="Suspicious" value={metrics.suspicious} to="/institution/suspicious-transactions" />
        <MetricCard label="Proof Generated" value={metrics.proofGenerated} to="/institution/approved-transactions" />
        <MetricCard label="Open Notices" value={metrics.openNotices} to="/institution/anomaly-notices" />
        <MetricCard label="High Risk" value={metrics.highRisk} to="/institution/suspicious-transactions" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold">Recent Transactions</h3>
            <Link to="/institution/transactions" className="text-sm font-semibold">
              View all
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {transactions.slice(0, 6).map((tx) => (
              <article key={tx.tx_id} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-bold">{tx.tx_id}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Risk score: {tx.risk_score ?? 0}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={tx.status} />
                    <StatusBadge status={tx.risk_level || "not_evaluated"} />
                  </div>
                </div>
              </article>
            ))}

            {transactions.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
                No transactions found yet.
              </div>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold">Anomaly Notices</h3>
            <Link to="/institution/anomaly-notices" className="text-sm font-semibold">
              View notices
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {notices.slice(0, 6).map((notice) => (
              <article key={notice.notice_id} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-bold">{notice.case_ref}</p>
                    <p className="mt-1 text-xs text-slate-500">{notice.summary}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={notice.risk_level} />
                    <StatusBadge status={notice.notice_status} />
                  </div>
                </div>
              </article>
            ))}

            {notices.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
                No anomaly notices for this partner bank yet.
              </div>
            ) : null}
          </div>
        </Card>
      </section>
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
