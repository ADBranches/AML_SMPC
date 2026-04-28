import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { transactionWorkflowApi, type TransactionWorkflowRow } from "../../api/transactionWorkflowApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { JsonViewer } from "../../components/ui/JsonViewer";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import type { TransactionPayload } from "../../types/transaction";

function generateTxId() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TX-WORKFLOW-${stamp}-${suffix}`;
}

function createPayload(txId: string): TransactionPayload {
  return {
    tx_id: txId,
    sender_id: "WF-SENDER-1001",
    receiver_id: "WF-RECEIVER-2002",
    sender_entity_id: 1001,
    receiver_entity_id: 2002,
    amount: 1250,
    currency: "USD",
    transaction_type: "wire_transfer",
    originator_name: "Workflow Sender",
    beneficiary_name: "Workflow Receiver",
    originator_institution: "Workflow Origin Bank",
    beneficiary_institution: "Workflow Beneficiary Bank",
    timestamp: new Date().toISOString(),
  };
}

export function NewTransactionPage() {
  const firstTxId = useMemo(() => generateTxId(), []);
  const [payload, setPayload] = useState<TransactionPayload>(() => createPayload(firstTxId));
  const [result, setResult] = useState<TransactionWorkflowRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof TransactionPayload>(key: K, value: TransactionPayload[K]) {
    setPayload((current) => ({ ...current, [key]: value }));
  }

  function fresh() {
    setPayload(createPayload(generateTxId()));
    setResult(null);
    setError("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await transactionWorkflowApi.create({
        ...payload,
        tx_id: payload.tx_id.trim() || generateTxId(),
        timestamp: new Date().toISOString(),
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction workflow.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Transaction Workflow"
        description="Submit a transaction request for reviewer approval before SMPC screening and proof generation."
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold">Enterprise Transaction Flow</h3>
            <p className="mt-1 text-sm text-slate-600">
              This does not immediately screen/prove the transaction. It creates a controlled workflow request.
            </p>
          </div>
          <button onClick={fresh} className="rounded-xl border px-4 py-2 text-sm font-semibold">
            Generate Fresh TX
          </button>
        </div>
      </Card>

      <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="font-bold">Transaction Details</h3>

          <label className="block text-sm font-semibold">
            Transaction ID
            <input className="mt-2 w-full rounded-xl border px-4 py-3 font-mono text-sm" value={payload.tx_id} onChange={(e) => update("tx_id", e.target.value)} />
          </label>

          <label className="block text-sm font-semibold">
            Amount
            <input className="mt-2 w-full rounded-xl border px-4 py-3" type="number" value={payload.amount} onChange={(e) => update("amount", Number(e.target.value))} />
          </label>

          <label className="block text-sm font-semibold">
            Currency
            <input className="mt-2 w-full rounded-xl border px-4 py-3" value={payload.currency} onChange={(e) => update("currency", e.target.value)} />
          </label>

          <label className="block text-sm font-semibold">
            Transaction Type
            <input className="mt-2 w-full rounded-xl border px-4 py-3" value={payload.transaction_type} onChange={(e) => update("transaction_type", e.target.value)} />
          </label>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-bold">Parties and Institutions</h3>

          <label className="block text-sm font-semibold">
            Sender ID
            <input className="mt-2 w-full rounded-xl border px-4 py-3" value={payload.sender_id} onChange={(e) => update("sender_id", e.target.value)} />
          </label>

          <label className="block text-sm font-semibold">
            Receiver ID
            <input className="mt-2 w-full rounded-xl border px-4 py-3" value={payload.receiver_id} onChange={(e) => update("receiver_id", e.target.value)} />
          </label>

          <label className="block text-sm font-semibold">
            Sender Entity ID
            <input className="mt-2 w-full rounded-xl border px-4 py-3" type="number" value={payload.sender_entity_id} onChange={(e) => update("sender_entity_id", Number(e.target.value))} />
          </label>

          <label className="block text-sm font-semibold">
            Receiver Entity ID
            <input className="mt-2 w-full rounded-xl border px-4 py-3" type="number" value={payload.receiver_entity_id} onChange={(e) => update("receiver_entity_id", Number(e.target.value))} />
          </label>

          <label className="block text-sm font-semibold">
            Originator Institution
            <input className="mt-2 w-full rounded-xl border px-4 py-3" value={payload.originator_institution} onChange={(e) => update("originator_institution", e.target.value)} />
          </label>

          <label className="block text-sm font-semibold">
            Beneficiary Institution
            <input className="mt-2 w-full rounded-xl border px-4 py-3" value={payload.beneficiary_institution} onChange={(e) => update("beneficiary_institution", e.target.value)} />
          </label>
        </Card>

        <div className="lg:col-span-2">
          <button disabled={loading} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? "Creating..." : "Create Workflow Request"}
          </button>
        </div>
      </form>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      {result ? (
        <Card>
          <h3 className="mb-3 font-bold">Workflow Created</h3>
          <p className="mb-3 text-sm text-slate-600">
            Status: <span className="font-bold">{result.status}</span>. A reviewer must approve this transaction before screening.
          </p>

          <div className="mb-4 flex flex-wrap gap-3">
            <Link to="/institution/transactions" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              View Transaction Queue
            </Link>
            <Link to={`/institution/transactions/${encodeURIComponent(result.tx_id)}/review`} className="rounded-xl border px-4 py-2 text-sm font-semibold">
              Open Review Page
            </Link>
          </div>

          <JsonViewer value={result} />
        </Card>
      ) : null}
    </div>
  );
}
