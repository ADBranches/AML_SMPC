import type { ProofDetail, VerifyProofResponse } from "../../types/proof";
import { StatusBadge } from "../ui/StatusBadge";

type ProofDetailPanelProps = {
  proof?: ProofDetail | null;
  verification?: VerifyProofResponse | null;
};

export function ProofDetailPanel({
  proof,
  verification,
}: ProofDetailPanelProps) {
  if (!proof) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
        Select a proof to view compliance-safe details.
      </div>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {proof.rule_id} proof
          </h3>
          <p className="font-mono text-xs text-slate-500">{proof.id}</p>
        </div>
        <StatusBadge status={proof.verification_status} />
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-slate-500">Transaction ID</dt>
          <dd className="font-mono text-slate-900">{proof.tx_id}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Public Signal</dt>
          <dd className="text-slate-900">
            {proof.public_signal ? "true" : "false"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-slate-500">Claim Hash</dt>
          <dd className="break-all font-mono text-xs text-slate-900">
            {proof.claim_hash ?? "not recorded"}
          </dd>
        </div>
      </dl>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-700">
          Proof Signal Payload
        </h4>
        <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-50">
          {JSON.stringify(proof.proof_blob ?? {}, null, 2)}
        </pre>
      </div>

      {verification ? (
        <div className="rounded-xl border bg-slate-50 p-4 text-sm">
          <p className="font-semibold text-slate-900">
            Verification result: {verification.verified ? "verified" : "failed"}
          </p>
          <p className="mt-1 text-slate-600">{verification.reason}</p>
        </div>
      ) : null}
    </section>
  );
}
