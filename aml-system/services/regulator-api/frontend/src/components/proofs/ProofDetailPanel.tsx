import type { ProofDetail, VerifyProofResponse } from "../../types/proof";
import { formatDate } from "../../utils/formatDate";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { JsonViewer } from "../ui/JsonViewer";
import { StatusBadge } from "../ui/StatusBadge";

type ProofDetailPanelProps = {
  proof: ProofDetail | null;
  verification: VerifyProofResponse | null;
};

export function ProofDetailPanel({ proof, verification }: ProofDetailPanelProps) {
  if (!proof) {
    return <EmptyState message="Select a proof to view compliance-safe details." />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Proof Detail</p>
            <h3 className="mt-1 text-lg font-bold text-slate-950">{proof.rule_id}</h3>
          </div>
          <StatusBadge status={proof.verification_status} />
        </div>

        <dl className="mt-5 grid gap-4 text-sm">
          <div>
            <dt className="font-semibold text-slate-500">Proof ID</dt>
            <dd className="break-all font-mono text-xs text-slate-800">{proof.id}</dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-500">Transaction ID</dt>
            <dd className="font-mono text-xs text-slate-800">{proof.tx_id}</dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-500">Claim Hash</dt>
            <dd className="break-all font-mono text-xs text-slate-800">{proof.claim_hash}</dd>
          </div>

          <div>
            <dt className="font-semibold text-slate-500">Created At</dt>
            <dd className="text-slate-800">{formatDate(proof.created_at)}</dd>
          </div>
        </dl>
      </Card>

      {verification ? (
        <Card>
          <p className="text-xs font-semibold uppercase text-slate-500">Verification Result</p>
          <h3 className="mt-2 text-2xl font-bold text-emerald-700">
            verified = {String(verification.verified)}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {verification.reason ?? verification.verification_status ?? "Proof verification completed."}
          </p>
        </Card>
      ) : null}

      <Card>
        <p className="mb-3 text-sm font-semibold text-slate-700">Proof Blob / Public Metadata</p>
        <JsonViewer value={proof.proof_blob ?? proof} />
      </Card>
    </div>
  );
}
