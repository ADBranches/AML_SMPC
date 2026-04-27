import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { proofsApi } from "../api/proofsApi";
import { ProofDetailPanel } from "../components/proofs/ProofDetailPanel";
import { VerifyProofButton } from "../components/proofs/VerifyProofButton";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingState } from "../components/ui/LoadingState";
import type { ProofDetail, VerifyProofResponse } from "../types/proof";

export function ProofDetailPage() {
  const { proofId } = useParams();
  const [proof, setProof] = useState<ProofDetail | null>(null);
  const [verification, setVerification] = useState<VerifyProofResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProof() {
      if (!proofId) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await proofsApi.getProof(proofId);
        setProof(data);
      } catch (err) {
        setProof(null);
        setError(err instanceof Error ? err.message : "Failed to load proof");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProof();
  }, [proofId]);

  async function verifyCurrentProof() {
    if (!proofId) {
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await proofsApi.verifyProof(proofId);
      setVerification(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify proof");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Proof Detail</h2>
          <p className="mt-2 text-slate-600">
            Inspect one proof artifact and trigger verification.
          </p>
        </div>
        {proofId ? (
          <VerifyProofButton
            isLoading={isVerifying}
            onVerify={verifyCurrentProof}
          />
        ) : null}
      </div>

      {error ? <ErrorBanner message={error} /> : null}
      {isLoading ? <LoadingState /> : null}

      <ProofDetailPanel proof={proof} verification={verification} />
    </div>
  );
}
