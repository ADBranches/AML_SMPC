import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { anomalyCasesApi, type BankAnomalyNotice } from "../../api/anomalyCasesApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function BankAnomalyNoticeDetailPage() {
  const { caseId = "" } = useParams();
  const [notice, setNotice] = useState<BankAnomalyNotice | null>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const next = await anomalyCasesApi.getBankNotice(caseId);
      setNotice(next);
      setResponse(next.bank_response || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load anomaly notice.");
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const next = await anomalyCasesApi.respondToNotice(caseId, response);
      setNotice(next);
      setMessage("Response submitted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit response.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    load();
  }, [caseId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anomaly Notice Detail"
        description="Respond to regulator case feedback using only your bank-visible case information."
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}
      {message ? (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {notice ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <Card>
              <p className="text-xs font-bold uppercase text-slate-500">Case</p>
              <p className="mt-2 font-mono text-xs font-bold">{notice.case_ref}</p>
            </Card>
            <Card>
              <p className="text-xs font-bold uppercase text-slate-500">Risk</p>
              <div className="mt-2"><StatusBadge status={notice.risk_level} /></div>
            </Card>
            <Card>
              <p className="text-xs font-bold uppercase text-slate-500">Notice</p>
              <div className="mt-2"><StatusBadge status={notice.notice_status} /></div>
            </Card>
            <Card>
              <p className="text-xs font-bold uppercase text-slate-500">Transaction</p>
              <p className="mt-2 font-mono text-xs font-bold">{notice.tx_id}</p>
            </Card>
          </section>

          <Card>
            <h3 className="font-bold">Regulator Finding</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">{notice.summary}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{notice.regulator_finding}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{notice.required_bank_action}</p>
          </Card>

          <Card>
            <h3 className="font-bold">Aggregate Evidence Summary</h3>
            <pre className="mt-4 max-h-80 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-white">
              {JSON.stringify(notice.aggregate_evidence_summary, null, 2)}
            </pre>
          </Card>

          <Card>
            <h3 className="font-bold">Bank Response</h3>
            <form onSubmit={submit} className="mt-4 space-y-4">
              <textarea
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                className="min-h-32 w-full rounded-xl border px-4 py-3"
                required
              />

              <button
                disabled={saving}
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Submitting..." : "Submit Response"}
              </button>
            </form>
          </Card>
        </>
      ) : null}
    </div>
  );
}
