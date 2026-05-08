import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  transactionWorkflowApi,
  type TransactionWorkflowRow,
} from "../../api/transactionWorkflowApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

type TriggeredRule = {
  rule_code?: string;
  rule_name?: string;
  risk_weight?: number;
  reason?: string;
};

function payloadValue(row: TransactionWorkflowRow | null, key: string): string {
  const value = row?.payload?.[key];

  if (value === null || value === undefined || value === "") return "N/A";

  return String(value);
}

function triggeredRules(row: TransactionWorkflowRow | null): TriggeredRule[] {
  const value = row?.triggered_rules;

  if (!Array.isArray(value)) return [];

  return value.filter((item): item is TriggeredRule => {
    return Boolean(item && typeof item === "object" && "rule_code" in item);
  });
}

export function ScreeningResultsPage() {
  const [searchParams] = useSearchParams();
  const initialTxId = searchParams.get("tx_id") ?? "TX-UI-DEMO-001";
  const [txId, setTxId] = useState(initialTxId);
  const [workflow, setWorkflow] = useState<TransactionWorkflowRow | null>(null);
  const [screeningResponse, setScreeningResponse] = useState<unknown>(null);
  const [riskUpdate, setRiskUpdate] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    setScreeningResponse(null);
    setRiskUpdate(null);

    try {
      setWorkflow(await transactionWorkflowApi.get(txId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transaction workflow");
    } finally {
      setLoading(false);
    }
  }

  async function runScreening() {
    setRunning(true);
    setError("");

    try {
      const response = await transactionWorkflowApi.runScreening(txId);
      const responseRecord = response as {
        workflow?: TransactionWorkflowRow;
        screening_response?: unknown;
        risk_update?: unknown;
      };

      if (responseRecord.workflow) {
        setWorkflow(responseRecord.workflow);
      }

      setScreeningResponse(responseRecord.screening_response ?? response);
      setRiskUpdate(responseRecord.risk_update ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run SMPC screening");
    } finally {
      setRunning(false);
    }
  }

  const rules = triggeredRules(workflow);

  return (
    <div className="space-y-6">
      <PageHeader
        title="SMPC Screening Results"
        description="Reviewer-facing screening view. SMPC evidence is linked into bank-side risk fields without exposing raw inputs from other banks."
      />

      <Card>
        <label className="text-sm font-semibold text-slate-700">Transaction ID</label>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <input
            value={txId}
            onChange={(event) => setTxId(event.target.value)}
            className="w-full rounded-xl border px-4 py-3 font-mono"
          />

          <button
            onClick={load}
            className="rounded-xl border px-5 py-3 text-sm font-semibold"
          >
            Load Workflow
          </button>

          <button
            onClick={runScreening}
            disabled={running}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {running ? "Running..." : "Run SMPC Screening"}
          </button>
        </div>
      </Card>

      {loading || running ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      {workflow ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <Card>
              <p className="text-xs font-bold uppercase text-slate-500">Workflow</p>
              <div className="mt-2">
                <StatusBadge status={workflow.status} />
              </div>
            </Card>

            <Card>
              <p className="text-xs font-bold uppercase text-slate-500">Risk Score</p>
              <h3 className="mt-2 text-3xl font-black">{workflow.risk_score ?? 0}</h3>
            </Card>

            <Card>
              <p className="text-xs font-bold uppercase text-slate-500">Risk Level</p>
              <div className="mt-2">
                <StatusBadge status={workflow.risk_level || "not_evaluated"} />
              </div>
            </Card>

            <Card>
              <p className="text-xs font-bold uppercase text-slate-500">Suspicion</p>
              <div className="mt-2">
                <StatusBadge status={workflow.suspicion_status || "not_evaluated"} />
              </div>
            </Card>
          </section>

          <Card>
            <h3 className="font-bold">Transaction Screening Context</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Amount</p>
                <p className="font-bold">
                  {payloadValue(workflow, "amount")} {payloadValue(workflow, "currency")}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Originator Institution</p>
                <p className="font-bold">{payloadValue(workflow, "originator_institution")}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Beneficiary Institution</p>
                <p className="font-bold">{payloadValue(workflow, "beneficiary_institution")}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold">Linked AML Rules</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {rules.map((rule) => (
                <article key={rule.rule_code} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold">{rule.rule_code}</p>
                      <h4 className="mt-1 font-bold">{rule.rule_name || "AML Rule"}</h4>
                    </div>
                    <span className="rounded-full border bg-slate-50 px-3 py-1 text-xs font-bold">
                      +{rule.risk_weight ?? 0}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{rule.reason || "Linked to screening evidence."}</p>
                </article>
              ))}

              {rules.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
                  No linked AML rules yet. Run SMPC screening for an approved transaction.
                </div>
              ) : null}
            </div>
          </Card>

          {workflow.recommended_action ? (
            <Card>
              <h3 className="font-bold">Recommended Action</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {workflow.recommended_action}
              </p>
              <div className="mt-4">
                <Link
                  to={`/institution/transactions/${workflow.tx_id}/risk`}
                  className="rounded-xl border px-4 py-2 text-sm font-semibold"
                >
                  Open Full Risk Evaluation
                </Link>
              </div>
            </Card>
          ) : null}
        </>
      ) : null}

      {(screeningResponse || riskUpdate) ? (
        <section className="grid gap-4 xl:grid-cols-2">
          <Card>
            <h3 className="font-bold">Raw Screening Response</h3>
            <pre className="mt-4 max-h-80 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-white">
              {JSON.stringify(screeningResponse, null, 2)}
            </pre>
          </Card>

          <Card>
            <h3 className="font-bold">Risk Update From SMPC Screening</h3>
            <pre className="mt-4 max-h-80 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-white">
              {JSON.stringify(riskUpdate, null, 2)}
            </pre>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
