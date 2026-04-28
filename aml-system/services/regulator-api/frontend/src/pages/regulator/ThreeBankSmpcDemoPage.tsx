import { useEffect, useMemo, useState } from "react";
import {
  buildDefaultThreeBankPayload,
  fetchSmpcStatus,
  runThreeBankSmpcDemo,
  type ThreeBankSmpcRequest,
  type ThreeBankSmpcResponse,
} from "../../api/threeBankSmpcApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";

export function ThreeBankSmpcDemoPage() {
  const [payload, setPayload] = useState<ThreeBankSmpcRequest>(() =>
    buildDefaultThreeBankPayload()
  );
  const [status, setStatus] = useState<unknown>(null);
  const [result, setResult] = useState<ThreeBankSmpcResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState("");

  const payloadJson = useMemo(() => JSON.stringify(payload, null, 2), [payload]);

  async function loadStatus() {
    setStatusLoading(true);
    setError("");

    try {
      setStatus(await fetchSmpcStatus());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load SMPC status.");
    } finally {
      setStatusLoading(false);
    }
  }

  async function runDemo() {
    setLoading(true);
    setError("");

    try {
      const nextPayload = {
        ...payload,
        tx_id: buildDefaultThreeBankPayload().tx_id,
      };

      setPayload(nextPayload);
      setResult(await runThreeBankSmpcDemo(nextPayload));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Three-bank SMPC demo failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Three-Bank SMPC Collaboration Demo"
        description="Demonstrates Bank A, Bank B, and Bank C contributing private/pseudonymized inputs for privacy-preserving AML screening while the regulator verifies proof/audit evidence downstream."
      />

      {error ? <ErrorBanner message={error} /> : null}

      <section className="grid gap-4 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">SMPC Parties</p>
          <h3 className="mt-2 text-3xl font-black">
            {result?.party_count ?? payload.parties.length}
          </h3>
          <p className="mt-2 text-sm text-slate-600">Bank A + Bank B + Bank C</p>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Aggregate Risk</p>
          <h3 className="mt-2 text-3xl font-black">
            {result?.aggregate_risk_score ?? "--"}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {result?.aggregate_risk_level ?? "Run demo to calculate"}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Cross-Bank Overlap</p>
          <h3 className="mt-2 text-3xl font-black">
            {result?.possible_cross_bank_overlap_count ?? "--"}
          </h3>
          <p className="mt-2 text-sm text-slate-600">Shared reference detection</p>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase text-slate-500">Raw Inputs Disclosed</p>
          <h3 className="mt-2 text-3xl font-black">
            {result ? String(result.raw_bank_inputs_disclosed) : "--"}
          </h3>
          <p className="mt-2 text-sm text-slate-600">Expected: false</p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Run Collaborative Screening</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This calls the SMPC runtime endpoint through the frontend Vite proxy and returns aggregate evidence only.
              </p>
            </div>

            <button
              onClick={runDemo}
              disabled={loading}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Running..." : "Run Three-Bank SMPC Demo"}
            </button>
          </div>

          {loading ? <LoadingState /> : null}

          <div className="mt-5 overflow-hidden rounded-2xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Bank</th>
                  <th className="px-4 py-3">Customer Refs</th>
                  <th className="px-4 py-3">Counterparty Refs</th>
                  <th className="px-4 py-3">Risk Inputs</th>
                  <th className="px-4 py-3">Accepted</th>
                </tr>
              </thead>
              <tbody>
                {(result?.party_contributions ?? payload.parties.map((party) => ({
                  bank_id: party.bank_id,
                  institution_name: party.institution_name,
                  private_customer_ref_count: party.private_customer_refs.length,
                  private_counterparty_ref_count: party.private_counterparty_refs.length,
                  encrypted_risk_score_count: party.encrypted_risk_scores.length,
                  contribution_accepted: false,
                }))).map((party) => (
                  <tr key={party.bank_id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{party.institution_name}</div>
                      <div className="font-mono text-xs text-slate-500">{party.bank_id}</div>
                    </td>
                    <td className="px-4 py-3">{party.private_customer_ref_count}</td>
                    <td className="px-4 py-3">{party.private_counterparty_ref_count}</td>
                    <td className="px-4 py-3">{party.encrypted_risk_score_count}</td>
                    <td className="px-4 py-3">{String(party.contribution_accepted)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold">SMPC Runtime Status</h3>

          {statusLoading ? <LoadingState /> : null}

          <pre className="mt-4 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
            {JSON.stringify(status, null, 2)}
          </pre>
        </Card>
      </section>

      {result ? (
        <Card>
          <h3 className="text-lg font-bold">Collaboration Evidence</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Transaction ID</p>
              <p className="mt-2 font-mono text-sm">{result.tx_id}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Execution Model</p>
              <p className="mt-2 font-mono text-sm">{result.execution_model}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Threshold Model</p>
              <p className="mt-2 text-sm">{result.threshold_model}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Screening Status</p>
              <p className="mt-2 font-mono text-sm">{result.screening_status}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-800">
            {result.evidence_statement}
          </div>
        </Card>
      ) : null}

      <Card>
        <h3 className="text-lg font-bold">Research Interpretation</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This page makes the research model visible in the frontend. The banks are the SMPC-style participants. The regulator is not treated as a raw-input computation party; the regulator verifies downstream proof and audit evidence.
        </p>

        <pre className="mt-4 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
          {payloadJson}
        </pre>
      </Card>
    </div>
  );
}
