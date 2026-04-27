import type { ProofRow } from "../../types/proof";
import { formatDate } from "../../utils/formatDate";
import { StatusBadge } from "../ui/StatusBadge";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "../ui/Button";

type ProofsTableProps = {
  proofs: ProofRow[];
  selectedProofId?: string;
  verifyingProofId?: string;
  onSelectProof: (proofId: string) => void;
  onVerifyProof: (proofId: string) => void;
};

export function ProofsTable({
  proofs,
  selectedProofId,
  verifyingProofId,
  onSelectProof,
  onVerifyProof,
}: ProofsTableProps) {
  if (proofs.length === 0) {
    return <EmptyState message="No proofs loaded yet. Search by transaction ID to begin." />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Proof ID</th>
            <th className="px-4 py-3">Recommendation</th>
            <th className="px-4 py-3">Signal</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {proofs.map((proof) => (
            <tr
              key={proof.id}
              className={`border-t border-slate-100 ${selectedProofId === proof.id ? "bg-slate-50" : ""}`}
            >
              <td className="max-w-[220px] truncate px-4 py-3 font-mono text-xs text-slate-700">
                {proof.id}
              </td>
              <td className="px-4 py-3 font-semibold text-slate-900">{proof.rule_id}</td>
              <td className="px-4 py-3">{String(proof.public_signal)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={proof.verification_status} />
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">{formatDate(proof.created_at)}</td>
              <td className="flex gap-2 px-4 py-3">
                <Button variant="secondary" onClick={() => onSelectProof(proof.id)}>
                  View
                </Button>
                <Button
                  onClick={() => onVerifyProof(proof.id)}
                  disabled={verifyingProofId === proof.id}
                >
                  {verifyingProofId === proof.id ? "Verifying..." : "Verify"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
