import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { transactionWorkflowApi, type TransactionWorkflowRow } from "../../api/transactionWorkflowApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function ApprovedTransactionsPage() {
  const [rows, setRows] = useState<TransactionWorkflowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await transactionWorkflowApi.list();
      setRows(data.filter((row) => ["approved", "screened", "proof_generated"].includes(row.status)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load approved transactions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Approved Transactions" description="Transactions approved for screening, already screened, or proof-generated." />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <Card>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
              <div>
                <p className="font-mono text-xs">{row.tx_id}</p>
                <p className="mt-1 text-sm text-slate-600">{row.submitted_by_email}</p>
              </div>
              <StatusBadge status={row.status} />
              <Link to={`/institution/transactions/${encodeURIComponent(row.tx_id)}/review`} className="rounded-lg border px-3 py-2 text-xs font-semibold">
                Open
              </Link>
            </div>
          ))}

          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">No approved/screened/proof-generated transactions yet.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
