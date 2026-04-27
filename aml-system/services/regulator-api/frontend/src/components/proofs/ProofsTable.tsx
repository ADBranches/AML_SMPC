import type { ProofRow } from "../../types/proof";
import { StatusBadge } from "../ui/StatusBadge";
import { VerifyProofButton } from "./VerifyProofButton";

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
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
        No proofs loaded yet. Search by transaction ID to begin.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Rule</th>
            <th className="px-4 py-3">Proof ID</th>
            <th className="px-4 py-3">Public Signal</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {proofs.map((proof) => (
            <tr
              key={proof.id}
              className={
                proof.id === selectedProofId ? "bg-slate-50" : "bg-white"
              }
            >
              <td className="px-4 py-3 font-semibold text-slate-900">
                {proof.rule_id}
              </td>
              <td className="max-w-[220px] truncate px-4 py-3 font-mono text-xs text-slate-600">
                {proof.id}
              </td>
              <td className="px-4 py-3">
                {proof.public_signal ? "true" : "false"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={proof.verification_status} />
              </td>
              <td className="px-4 py-3 text-slate-500">
                {proof.created_at ?? "not recorded"}
              </td>
              <td className="space-x-2 px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onSelectProof(proof.id)}
                  className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                >
                  View
                </button>
                <VerifyProofButton
                  isLoading={verifyingProofId === proof.id}
                  onVerify={() => onVerifyProof(proof.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
