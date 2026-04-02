import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, BadgeCheck, ShieldCheck } from 'lucide-react';
import { fetchAuditTimeline, fetchProofById, verifyProof } from '@/lib/api';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import StatusBadge from '@/components/StatusBadge';
import AuditTimeline from '@/components/AuditTimeline';
import { format } from 'date-fns';

function formatDate(value) {
  try {
    return format(new Date(value), 'yyyy-MM-dd HH:mm:ss');
  } catch {
    return value;
  }
}

export default function ProofDetailPage() {
  const { proofId } = useParams();
  const [verificationResult, setVerificationResult] = useState(null);

  const proofQuery = useQuery({
    queryKey: ['proof', proofId],
    queryFn: () => fetchProofById(proofId),
    enabled: Boolean(proofId),
  });

  const txId = proofQuery.data?.txId;

  const auditQuery = useQuery({
    queryKey: ['audit', txId],
    queryFn: () => fetchAuditTimeline(txId),
    enabled: Boolean(txId),
  });

  const verifyMutation = useMutation({
    mutationFn: () => verifyProof(proofId),
    onSuccess: (data) => setVerificationResult(data),
  });

  if (proofQuery.isLoading) {
    return <LoadingState label="Loading proof detail..." />;
  }

  if (proofQuery.isError) {
    return <ErrorState title="Failed to load proof detail" detail={proofQuery.error?.message} />;
  }

  const proof = proofQuery.data ?? {
    id: 'unknown-proof',
    txId: 'unknown-tx',
    ruleId: 'unknown-rule',
    verificationStatus: 'unknown',
    createdAt: '',
    claimHash: '',
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to proofs
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Proof detail</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-100">{proof.ruleId}</h2>
              <p className="mt-2 font-mono text-xs text-slate-500">{proof.id}</p>
            </div>
            <StatusBadge value={verificationResult?.verified ? 'verified' : proof.verificationStatus} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Transaction ID</p>
              <p className="mt-2 text-sm font-medium text-slate-100">{proof.txId}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Created</p>
              <p className="mt-2 text-sm font-medium text-slate-100">{formatDate(proof.createdAt)}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">Claim hash</p>
              <p className="mt-2 break-all font-mono text-xs text-slate-300">{proof.claimHash || 'not provided'}</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="h-4 w-4 text-sky-400" />
              <span className="text-sm font-medium">Privacy note</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              This dashboard intentionally avoids displaying raw customer identifiers. The regulator view is limited to
              proof metadata, compliance linkage, and audit visibility.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Actions</p>
            <button
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <BadgeCheck className="h-4 w-4" />
              {verifyMutation.isPending ? 'Verifying...' : 'Verify proof'}
            </button>
          </div>

          {verifyMutation.isError ? (
            <ErrorState title="Verification failed" detail={verifyMutation.error?.message} />
          ) : null}

          {verificationResult ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
              <p className="font-medium text-slate-100">Verification result</p>
              <p className="mt-2">
                verified: <span className="font-semibold">{String(verificationResult.verified)}</span>
              </p>
              <p className="mt-2 break-words text-slate-400">
                reason: {verificationResult.reason || 'no reason returned'}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {auditQuery.isLoading ? <LoadingState label="Loading audit timeline..." /> : null}
      {auditQuery.isError ? <ErrorState title="Failed to load audit timeline" detail={auditQuery.error?.message} /> : null}
      <AuditTimeline items={auditQuery.data} />
    </div>
  );
}