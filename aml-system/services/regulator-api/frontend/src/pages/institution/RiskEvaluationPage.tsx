import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  riskEvaluationApi,
  type RiskEvaluationResponse,
  type TransactionWorkflow,
  type TriggeredRiskRule,
} from "../../api/riskEvaluationApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

function triggeredRules(row?: TransactionWorkflow | null): TriggeredRiskRule[] {
  if (!row || !Array.isArray(row.triggered_rules)) return [];

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

function payloadValue(row: TransactionWorkflow | null, key: string): string {
  const value = row?.payload?.[key];

  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  return String(value);
}

export function RiskEvaluationPage() {
  const params = useParams();
  const [txId, setTxId] = useState(params.txId || "");
  const [workflow, setWorkflow] = useState<TransactionWorkflow | null>(null);
  const [result, setResult] = useState<RiskEvaluationResponse | null>(null);
  const [reviewNotes, setReviewNotes] = useState(
    "Reviewer executed bank-side AML risk evaluation before regulator verification."
  );
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");

  async function loadTransaction(nextTxId = txId) {
    if (!nextTxId.trim()) {
      setError("Enter a transaction ID first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      setWorkflow(await riskEvaluationApi.getTransaction(nextTxId.trim()));
    } catch (err) {
      setWorkflow(null);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transaction workflow."
      );
    } finally {
      setLoading(false);
    }
  }

  async function evaluateRisk() {
    if (!txId.trim()) {
      setError("Enter a transaction ID first.");
      return;
    }

    setEvaluating(true);
    setError("");

    try {
      const response = await riskEvaluationApi.evaluateRisk(
        txId.trim(),
        reviewNotes
      );
      setResult(response);
      setWorkflow(response.workflow);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to evaluate transaction risk."
      );
    } finally {
      setEvaluating(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    loadTransaction();
  }

  useEffect(() => {
    if (params.txId) {
      loadTransaction(params.txId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.txId]);

  const rules = result?.triggered_rules || triggeredRules(workflow);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank-Side Risk Evaluation"
        description="Evaluate AML suspicion at bank-reviewer level before regulator proof verification. This page demonstrates that the bank identifies suspicious transactions first."
      />

      {error ? <ErrorBanner message={error} /> : null}

      <Card>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="block text-sm font-semibold">
            Transaction ID
            <input
              value={txId}
              onChange={(event) => setTxId(event.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3 font-mono"
              placeholder="TX-RISK-20260501181736"
              required
            />
          </label>

          <button
            className="self-end rounded-xl border px-5 py-3 text-sm font-semibold"
            type="submit"
          >
            Load Transaction
          </button>
        </form>
      </Card>

      {loading ? <LoadingState /> : null}

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
              <h3 className="mt-2 text-3xl font-black">{workflow.risk_score ?? "--"}</h3>
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
            <h3 className="font-bold">Transaction Summary</h3>

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

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Counterparty Risk</p>
                <p className="font-mono text-xs font-bold">{payloadValue(workflow, "counterparty_risk")}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">CDD Status</p>
                <p className="font-mono text-xs font-bold">{payloadValue(workflow, "cdd_status")}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">SMPC Overlap</p>
                <p className="font-bold">{payloadValue(workflow, "possible_cross_bank_overlap_count")}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold">Reviewer Action</h3>

            <label className="mt-4 block text-sm font-semibold">
              Review Notes
              <textarea
                value={reviewNotes}
                onChange={(event) => setReviewNotes(event.target.value)}
                className="mt-2 min-h-28 w-full rounded-xl border px-4 py-3"
              />
            </label>

            <button
              onClick={evaluateRisk}
              disabled={evaluating}
              className="mt-4 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {evaluating ? "Evaluating..." : "Evaluate Risk"}
            </button>
          </Card>

          <Card>
            <h3 className="font-bold">Triggered AML Rules</h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {rules.map((rule) => (
                <article key={rule.rule_code} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold">{rule.rule_code}</p>
                      <h4 className="mt-1 font-bold">{rule.rule_name}</h4>
                    </div>
                    <span className="rounded-full border bg-slate-50 px-3 py-1 text-xs font-bold">
                      +{rule.risk_weight}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{rule.reason}</p>
                </article>
              ))}

              {rules.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
                  No AML rules have been triggered yet. Click Evaluate Risk.
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
                  to="/institution/suspicious-transactions"
                  className="rounded-xl border px-4 py-2 text-sm font-semibold"
                >
                  Open Suspicious Transaction Queue
                </Link>
              </div>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
