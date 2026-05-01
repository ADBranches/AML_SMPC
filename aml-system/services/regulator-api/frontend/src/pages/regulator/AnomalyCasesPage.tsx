import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { anomalyCasesApi, type AnomalyCase } from "../../api/anomalyCasesApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function AnomalyCasesPage() {
  const [cases, setCases] = useState<AnomalyCase[]>([]);
  const [txId, setTxId] = useState("");
  const [summary, setSummary] = useState("");
  const [finding, setFinding] = useState("");
  const [requiredAction, setRequiredAction] = useState("");
  const [organizationIds, setOrganizationIds] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      setCases(await anomalyCasesApi.listCases());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load anomaly cases.");
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError("");

    try {
      const ids = organizationIds
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await anomalyCasesApi.createCase({
        tx_id: txId,
        summary,
        regulator_finding: finding || undefined,
        required_bank_action: requiredAction || undefined,
        notified_organization_ids: ids.length ? ids : undefined,
      });

      setTxId("");
      setSummary("");
      setFinding("");
      setRequiredAction("");
      setOrganizationIds("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create anomaly case.");
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulator Anomaly Cases"
        description="Convert suspicious SMPC/risk evidence into regulator case reports and notify involved banks without exposing raw cross-bank data."
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <Card>
        <h3 className="font-bold">Open Anomaly Case</h3>

        <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold">
            Transaction ID
            <input
              value={txId}
              onChange={(event) => setTxId(event.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3 font-mono"
              required
            />
          </label>

          <label className="block text-sm font-semibold">
            Notified Organization IDs
            <input
              value={organizationIds}
              onChange={(event) => setOrganizationIds(event.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3 font-mono"
              placeholder="optional comma-separated UUIDs"
            />
          </label>

          <label className="block text-sm font-semibold md:col-span-2">
            Summary
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-xl border px-4 py-3"
              required
            />
          </label>

          <label className="block text-sm font-semibold md:col-span-2">
            Regulator Finding
            <textarea
              value={finding}
              onChange={(event) => setFinding(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-xl border px-4 py-3"
            />
          </label>

          <label className="block text-sm font-semibold md:col-span-2">
            Required Bank Action
            <textarea
              value={requiredAction}
              onChange={(event) => setRequiredAction(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-xl border px-4 py-3"
            />
          </label>

          <div className="md:col-span-2">
            <button
              disabled={creating}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {creating ? "Creating..." : "Open Anomaly Case"}
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold">Cases</h3>
          <button onClick={load} className="rounded-xl border px-4 py-2 text-sm font-semibold">
            Refresh
          </button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border">
          <table className="min-w-[1000px] w-full text-left text-sm">
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
              {cases.map((item) => (
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
      </Card>
    </div>
  );
}
