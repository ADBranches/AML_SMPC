import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { transactionsApi } from "../../api/transactionsApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { JsonViewer } from "../../components/ui/JsonViewer";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import type {
  TransactionPayload,
  TransactionSubmitResponse,
} from "../../types/transaction";

function generateTxId() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);

  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `TX-UI-DEMO-${stamp}-${suffix}`;
}

function createPayload(txId: string): TransactionPayload {
  return {
    tx_id: txId,
    sender_id: "UI-SENDER-1001",
    receiver_id: "UI-RECEIVER-2002",
    sender_entity_id: 1001,
    receiver_entity_id: 2002,
    amount: 1250,
    currency: "USD",
    transaction_type: "wire_transfer",
    originator_name: "Synthetic Sender",
    beneficiary_name: "Synthetic Receiver",
    originator_institution: "Demo Origin Bank",
    beneficiary_institution: "Demo Beneficiary Bank",
    timestamp: new Date().toISOString(),
  };
}

function normalizePayload(payload: TransactionPayload): TransactionPayload {
  return {
    ...payload,
    tx_id: payload.tx_id.trim() || generateTxId(),
    sender_id: payload.sender_id.trim(),
    receiver_id: payload.receiver_id.trim(),
    currency: payload.currency.trim().toUpperCase(),
    transaction_type: payload.transaction_type.trim(),
    originator_name: payload.originator_name.trim(),
    beneficiary_name: payload.beneficiary_name.trim(),
    originator_institution: payload.originator_institution.trim(),
    beneficiary_institution: payload.beneficiary_institution.trim(),
    timestamp: new Date().toISOString(),
  };
}

export function NewTransactionPage() {
  const firstTxId = useMemo(() => generateTxId(), []);
  const [payload, setPayload] = useState<TransactionPayload>(() =>
    createPayload(firstTxId)
  );
  const [result, setResult] = useState<TransactionSubmitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function update<K extends keyof TransactionPayload>(
    key: K,
    value: TransactionPayload[K]
  ) {
    setPayload((current) => ({ ...current, [key]: value }));
  }

  function generateNewTransaction() {
    setPayload(createPayload(generateTxId()));
    setResult(null);
    setError("");
    setNotice("Generated a fresh transaction ID for a new demo submission.");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setNotice("");
    setResult(null);

    let safePayload = normalizePayload(payload);

    try {
      const response = await transactionsApi.submit(safePayload);
      setPayload(safePayload);
      setResult(response);
      setNotice("Transaction submitted successfully.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const retryPayload = {
          ...safePayload,
          tx_id: generateTxId(),
          timestamp: new Date().toISOString(),
        };

        try {
          const retryResponse = await transactionsApi.submit(retryPayload);
          setPayload(retryPayload);
          setResult(retryResponse);
          setNotice(
            "The previous transaction ID already existed, so the UI generated a fresh ID and resubmitted successfully."
          );
        } catch (retryErr) {
          setPayload(retryPayload);
          setError(
            retryErr instanceof Error
              ? retryErr.message
              : "A duplicate transaction was detected and automatic retry failed."
          );
        }
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to submit transaction. Confirm backend services are running."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submit Synthetic Transaction"
        description="Submit a transaction into the privacy-preserving AML workflow. The backend pseudonymizes identifiers, triggers SMPC screening, and records audit evidence."
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-950">
              Autonomous Demo Transaction
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              The UI generates unique transaction IDs and handles duplicate
              conflicts gracefully.
            </p>
          </div>

          <button
            type="button"
            onClick={generateNewTransaction}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Generate New TX ID
          </button>
        </div>
      </Card>

      <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="font-bold">Transaction Details</h3>

          <label className="block text-sm font-semibold">
            Transaction ID
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3 font-mono text-sm"
              value={payload.tx_id}
              onChange={(e) => update("tx_id", e.target.value)}
            />
          </label>

          <label className="block text-sm font-semibold">
            Amount
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              type="number"
              value={payload.amount}
              onChange={(e) => update("amount", Number(e.target.value))}
            />
          </label>

          <label className="block text-sm font-semibold">
            Currency
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              value={payload.currency}
              onChange={(e) => update("currency", e.target.value)}
            />
          </label>

          <label className="block text-sm font-semibold">
            Transaction Type
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              value={payload.transaction_type}
              onChange={(e) => update("transaction_type", e.target.value)}
            />
          </label>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-bold">Parties and Institutions</h3>

          <label className="block text-sm font-semibold">
            Sender ID
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              value={payload.sender_id}
              onChange={(e) => update("sender_id", e.target.value)}
            />
          </label>

          <label className="block text-sm font-semibold">
            Receiver ID
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              value={payload.receiver_id}
              onChange={(e) => update("receiver_id", e.target.value)}
            />
          </label>

          <label className="block text-sm font-semibold">
            Sender Entity ID
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              type="number"
              value={payload.sender_entity_id}
              onChange={(e) =>
                update("sender_entity_id", Number(e.target.value))
              }
            />
          </label>

          <label className="block text-sm font-semibold">
            Receiver Entity ID
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              type="number"
              value={payload.receiver_entity_id}
              onChange={(e) =>
                update("receiver_entity_id", Number(e.target.value))
              }
            />
          </label>

          <label className="block text-sm font-semibold">
            Originator Institution
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              value={payload.originator_institution}
              onChange={(e) =>
                update("originator_institution", e.target.value)
              }
            />
          </label>

          <label className="block text-sm font-semibold">
            Beneficiary Institution
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              value={payload.beneficiary_institution}
              onChange={(e) =>
                update("beneficiary_institution", e.target.value)
              }
            />
          </label>
        </Card>

        <div className="lg:col-span-2">
          <button
            disabled={loading}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Transaction"}
          </button>
        </div>
      </form>

      {loading ? <LoadingState /> : null}

      {notice ? (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-700">
          {notice}
        </div>
      ) : null}

      {error ? <ErrorBanner message={error} /> : null}

      {result ? (
        <Card>
          <h3 className="mb-3 font-bold">Submission Response</h3>

          <p className="mb-3 text-sm text-slate-600">
            Use this returned transaction ID to verify audit and regulator
            evidence:
            <span className="ml-2 font-mono font-bold">{result.tx_id}</span>
          </p>

          <div className="mb-4 flex flex-wrap gap-3">
            <Link
              to={`/institution/screening-results?tx_id=${encodeURIComponent(
                result.tx_id
              )}`}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            >
              View Screening Evidence
            </Link>

            <Link
              to={`/regulator/audit?tx_id=${encodeURIComponent(result.tx_id)}`}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
            >
              Open Regulator Audit
            </Link>
          </div>

          <div className="mb-4 rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
            <p>
              curl -fsS "http://127.0.0.1:8085/audit/{result.tx_id}" | jq .
            </p>
          </div>

          <JsonViewer value={result} />
        </Card>
      ) : null}
    </div>
  );
}
