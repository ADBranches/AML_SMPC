import { useState } from "react";
import { proofsApi } from "../api/proofsApi";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingState } from "../components/ui/LoadingState";
import { ProofDetailPanel } from "../components/proofs/ProofDetailPanel";
import { ProofSearchForm } from "../components/proofs/ProofSearchForm";
import { ProofsTable } from "../components/proofs/ProofsTable";
import type {
  ProofDetail,
  ProofRow,
  VerifyProofResponse,
} from "../types/proof";

const defaultTxId = "TX-PHASE73-R16-001";

export function ProofsPage() {
  const [txId, setTxId] = useState(defaultTxId);
  const [proofs, setProofs] = useState<ProofRow[]>([]);
  const [selectedProof, setSelectedProof] = useState<ProofDetail | null>(null);
  const [verification, setVerification] = useState<VerifyProofResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [verifyingProofId, setVerifyingProofId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  async function loadProofs() {
    setIsLoading(true);
    setError(null);
    setSelectedProof(null);
    setVerification(null);

    try {
      const data = await proofsApi.listByTransaction(txId.trim());
      setProofs(data);
    } catch (err) {
      setProofs([]);
      setError(err instanceof Error ? err.message : "Failed to load proofs");
    } finally {
      setIsLoading(false);
    }
  }

  async function selectProof(proofId: string) {
    setError(null);
    setVerification(null);

    try {
      const detail = await proofsApi.getProof(proofId);
      setSelectedProof(detail);
    } catch (err) {
      setSelectedProof(null);
      setError(err instanceof Error ? err.message : "Failed to load proof");
    }
  }

  async function verifyProof(proofId: string) {
    setVerifyingProofId(proofId);
    setError(null);

    try {
      const result = await proofsApi.verifyProof(proofId);
      setVerification(result);

      if (!selectedProof || selectedProof.id !== proofId) {
        await selectProof(proofId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify proof");
    } finally {
      setVerifyingProofId(undefined);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Proofs</h2>
        <p className="mt-2 text-slate-600">
          Search proof artifacts by transaction ID, inspect safe metadata, and
          verify regulator-facing proof status.
        </p>
      </div>

      <ProofSearchForm
        txId={txId}
        isLoading={isLoading}
        onTxIdChange={setTxId}
        onSubmit={loadProofs}
      />

      {error ? <ErrorBanner message={error} /> : null}
      {isLoading ? <LoadingState /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <ProofsTable
          proofs={proofs}
          selectedProofId={selectedProof?.id}
          verifyingProofId={verifyingProofId}
          onSelectProof={selectProof}
          onVerifyProof={verifyProof}
        />
        <ProofDetailPanel proof={selectedProof} verification={verification} />
      </div>
    </div>
  );
}
