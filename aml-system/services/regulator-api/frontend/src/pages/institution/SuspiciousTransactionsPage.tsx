import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  riskEvaluationApi,
  type TransactionWorkflow,
  type TriggeredRiskRule,
} from "../../api/riskEvaluationApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

function payloadText(row: TransactionWorkflow, key: string): string {
  const value = row.payload?.[key];

  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return String(value);
}

function triggeredRules(row: TransactionWorkflow): TriggeredRiskRule[] {
  if (!Array.isArray(row.triggered_rules)) return [];

  return row.triggered_rules
    .filter((item): item is TriggeredRiskRule => {
      return Boolean(
        item &&
          typeof item === "object" &&
          "rule_code" in item &&
          "risk_weight" in item
      );
    });
}

export function SuspiciousTransactionsPage() {
  const [rows, setRows] = useState<TransactionWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      setRows(await riskEvaluationApi.listSuspiciousTransactions());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load suspicious transactions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const suspiciousCount = rows.filter(
    (row) => row.suspicion_status === "suspicious"
  ).length;

  const highRiskCount = rows.filter((row) => row.risk_level === "high").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suspicious Transactions"
        description="Bank-side view of AML risk-evaluated transactions before regulator verification. This proves the bank identifies suspicious activity first."
      />

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Risk Evaluated</p>
          <h3 className="mt-2 text-3xl font-black">{rows.length}</h3>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Suspicious</p>
          <h3 className="mt-2 text-3xl font-black">{suspiciousCount}</h3>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">High Risk</p>
          <h3 className="mt-2 text-3xl font-black">{highRiskCount}</h3>
        </Card>
      </section>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold">Bank-Side Risk Queue</h3>
          <button
            onClick={load}
            className="rounded-xl border px-4 py-2 text-sm font-semibold"
          >
            Refresh
          </button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Transaction</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Suspicion</th>
                <th className="px-4 py-3">Triggered Rules</th>
                <th className="px-4 py-3">Reviewer</th>
                <th className="px-4 py-3">Screened At</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => {
                const rules = triggeredRules(row);

                return (
                  <tr key={row.tx_id} className="border-t align-top">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs font-bold">{row.tx_id}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {payloadText(row, "transaction_type")}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold">
                        {payloadText(row, "amount")} {payloadText(row, "currency")}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold">{row.risk_score ?? 0}</div>
                      <StatusBadge status={row.risk_level || "not_evaluated"} />
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={row.suspicion_status || "not_evaluated"} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex max-w-sm flex-wrap gap-2">
                        {rules.length > 0 ? (
                          rules.map((rule) => (
                            <span
                              key={rule.rule_code}
                              className="rounded-full border bg-slate-50 px-2 py-1 font-mono text-[11px]"
                            >
                              {rule.rule_code}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">No rules yet</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {row.risk_screened_by_email || "N/A"}
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {row.risk_screened_at || "N/A"}
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        to={`/institution/transactions/${row.tx_id}/risk`}
                        className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                      >
                        View / Evaluate
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && !loading ? (
          <div className="mt-5 rounded-xl border border-dashed p-6 text-sm text-slate-500">
            No suspicious or risk-evaluated transactions found yet. Evaluate risk from the Risk Evaluation page.
          </div>
        ) : null}
      </Card>
    </div>
  );
}
