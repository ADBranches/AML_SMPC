import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { transactionWorkflowApi, type TransactionWorkflowRow } from "../../api/transactionWorkflowApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { JsonViewer } from "../../components/ui/JsonViewer";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function TransactionReviewPage() {
  const { txId = "" } = useParams();
  const [row, setRow] = useState<TransactionWorkflowRow | null>(null);
  const [note, setNote] = useState("Reviewed and approved for SMPC screening.");
  const [output, setOutput] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!txId) return;
    setLoading(true);
    setError("");
    try {
      setRow(await transactionWorkflowApi.get(txId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transaction.");
    } finally {
      setLoading(false);
    }
  }

  async function run(label: string, action: () => Promise<unknown>) {
    setLoading(true);
    setError("");
    setOutput(null);
    try {
      const result = await action();
      setOutput({ action: label, result });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : `${label} failed.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [txId]);

  return (
    <div className="space-y-6">
      <PageHeader title="Transaction Review" description="Approve/reject submitted transactions, then run screening and proof generation." />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      {row ? (
        <>
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-sm">{row.tx_id}</p>
                <h3 className="mt-2 text-xl font-bold">Status: {row.status}</h3>
                <p className="mt-2 text-sm text-slate-600">Submitted by {row.submitted_by_email}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>

            <label className="mt-5 block text-sm font-semibold">
              Review Note
              <textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border px-4 py-3" />
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => run("approve", () => transactionWorkflowApi.approve(row.tx_id, note))} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Approve</button>
              <button onClick={() => run("reject", () => transactionWorkflowApi.reject(row.tx_id, note || "Rejected by reviewer."))} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700">Reject</button>
              <button onClick={() => run("run_screening", () => transactionWorkflowApi.runScreening(row.tx_id))} className="rounded-xl border px-4 py-2 text-sm font-semibold">Run Screening</button>
              <button onClick={() => run("generate_proofs", () => transactionWorkflowApi.generateProofs(row.tx_id))} className="rounded-xl border px-4 py-2 text-sm font-semibold">Generate Proofs</button>
              <Link to={`/institution/screening-results?tx_id=${encodeURIComponent(row.tx_id)}`} className="rounded-xl border px-4 py-2 text-sm font-semibold">View Audit</Link>
            </div>
          </Card>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="mb-3 font-bold">Payload</h3>
              <JsonViewer value={row.payload} />
            </Card>
            <Card>
              <h3 className="mb-3 font-bold">Action Output</h3>
              <JsonViewer value={output ?? { message: "No action run yet." }} />
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}
