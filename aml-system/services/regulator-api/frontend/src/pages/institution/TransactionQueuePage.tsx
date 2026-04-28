import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { transactionWorkflowApi, type TransactionWorkflowRow } from "../../api/transactionWorkflowApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function TransactionQueuePage() {
  const [rows, setRows] = useState<TransactionWorkflowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setRows(await transactionWorkflowApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Transaction Queue" description="Submitted transactions awaiting review, screening, or proof generation." />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold">Workflow Requests</h3>
          <button onClick={load} className="rounded-xl border px-4 py-2 text-sm font-semibold">Refresh</button>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Transaction</th>
                <th className="px-4 py-3">Submitter</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-xs">{row.tx_id}</td>
                  <td className="px-4 py-3">{row.submitted_by_email}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                  <td className="px-4 py-3 text-xs">{new Date(row.submitted_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Link to={`/institution/transactions/${encodeURIComponent(row.tx_id)}/review`} className="rounded-lg border px-3 py-2 text-xs font-semibold">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr><td className="px-4 py-6 text-slate-500" colSpan={5}>No transaction workflows found.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
