import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { anomalyCasesApi, type BankAnomalyNotice } from "../../api/anomalyCasesApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function BankAnomalyNoticesPage() {
  const [rows, setRows] = useState<BankAnomalyNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      setRows(await anomalyCasesApi.listBankNotices());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load anomaly notices.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const openCount = rows.filter((row) => row.notice_status !== "responded" && row.notice_status !== "closed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Anomaly Notices"
        description="Bank-side regulator notices. Only aggregate case information is shown; raw data from other banks is never exposed."
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Notices</p>
          <h3 className="mt-2 text-3xl font-black">{rows.length}</h3>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Open</p>
          <h3 className="mt-2 text-3xl font-black">{openCount}</h3>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">High Risk</p>
          <h3 className="mt-2 text-3xl font-black">{rows.filter((row) => row.risk_level === "high").length}</h3>
        </Card>
      </section>

      <Card>
        <h3 className="font-bold">Notice Inbox</h3>

        <div className="mt-5 overflow-x-auto rounded-2xl border">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Case</th>
                <th className="px-4 py-3">Transaction</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Notice</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.notice_id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-bold">{row.case_ref}</div>
                    <div className="mt-1 text-xs text-slate-500">{row.summary}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{row.tx_id}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.risk_level} /></td>
                  <td className="px-4 py-3"><StatusBadge status={row.notice_status} /></td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/institution/anomaly-notices/${row.case_id}`}
                      className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                    >
                      View / Respond
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
