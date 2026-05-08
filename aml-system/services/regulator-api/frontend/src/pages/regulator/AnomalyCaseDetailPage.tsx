import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { anomalyCasesApi, type AnomalyCase } from "../../api/anomalyCasesApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function AnomalyCaseDetailPage() {
  const { caseId = "" } = useParams();
  const [item, setItem] = useState<AnomalyCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      setItem(await anomalyCasesApi.getCase(caseId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load anomaly case."
      );
    } finally {
      setLoading(false);
    }
  }

  async function closeCase() {
    setNotice("");
    setError("");

    try {
      setItem(await anomalyCasesApi.closeCase(caseId));
      setNotice("Case closed successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to close case."
      );
    }
  }

  useEffect(() => {
    load();
  }, [caseId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anomaly Case Detail"
        description="Regulator view of case findings, notified banks, and response status."
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      {notice ? (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-700">
          {notice}
        </div>
      ) : null}

      {item ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <Card>
              <p className="text-xs font-bold uppercase text-slate-500">Case</p>
              <p className="mt-2 font-mono text-xs font-bold">{item.case_ref}</p>
            </Card>

            <Card>
              <p className="text-xs font-bold uppercase text-slate-500">Risk</p>
              <div className="mt-2">
                <StatusBadge status={item.risk_level} />
              </div>
            </Card>

            <Card>
              <p className="text-xs font-bold uppercase text-slate-500">Status</p>
              <div className="mt-2">
                <StatusBadge status={item.case_status} />
              </div>
            </Card>

            <Card>
              <p className="text-xs font-bold uppercase text-slate-500">
                Banks Notified
              </p>
              <h3 className="mt-2 text-3xl font-black">
                {item.bank_notices.length}
              </h3>
            </Card>
          </section>

          <Card>
            <h3 className="font-bold">Finding</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {item.summary}
            </p>
            {item.regulator_finding ? (
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {item.regulator_finding}
              </p>
            ) : null}
            {item.required_bank_action ? (
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {item.required_bank_action}
              </p>
            ) : null}

            {item.case_status !== "closed" ? (
              <button
                onClick={closeCase}
                className="mt-5 rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"
              >
                Close Case
              </button>
            ) : null}
          </Card>

          <Card>
            <h3 className="font-bold">Bank Notices</h3>

            <div className="mt-5 overflow-x-auto rounded-2xl border">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Bank</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Notice</th>
                    <th className="px-4 py-3">Response</th>
                  </tr>
                </thead>
                <tbody>
                  {item.bank_notices.map((notice) => (
                    <tr
                      key={notice.notice_id}
                      className="border-t align-top"
                    >
                      <td className="px-4 py-3">
                        {notice.organization_name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {notice.bank_code || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={notice.notice_status} />
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {notice.bank_response || "No response yet"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
