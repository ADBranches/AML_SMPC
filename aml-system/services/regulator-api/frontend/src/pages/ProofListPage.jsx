import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Search } from 'lucide-react';
import { fetchProofs } from '@/lib/api';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import ProofTable from '@/components/ProofTable';

export default function ProofListPage() {
  const [txIdFilter, setTxIdFilter] = useState('');
  const [ruleFilter, setRuleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['proofs'],
    queryFn: () => fetchProofs(),
  });

  const safeData = Array.isArray(data) ? data : [];

  const ruleOptions = useMemo(
    () => [...new Set(safeData.map((proof) => proof.ruleId).filter(Boolean))],
    [safeData]
  );

  const statusOptions = useMemo(
    () => [...new Set(safeData.map((proof) => proof.verificationStatus).filter(Boolean))],
    [safeData]
  );

  const filteredProofs = useMemo(() => {
    return safeData.filter((proof) => {
      const matchesTx = txIdFilter
        ? String(proof.txId || '').toLowerCase().includes(txIdFilter.toLowerCase())
        : true;
      const matchesRule = ruleFilter ? proof.ruleId === ruleFilter : true;
      const matchesStatus = statusFilter ? proof.verificationStatus === statusFilter : true;
      return matchesTx && matchesRule && matchesStatus;
    });
  }, [safeData, txIdFilter, ruleFilter, statusFilter]);

  if (isLoading) {
    return <LoadingState label="Loading proofs from regulator backend..." />;
  }

  if (isError) {
    return <ErrorState title="Failed to load proofs" detail={error?.message} />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Search by transaction ID
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={txIdFilter}
              onChange={(e) => setTxIdFilter(e.target.value)}
              placeholder="e.g. TX-E2E-001"
              className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Rule filter
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={ruleFilter}
              onChange={(e) => setRuleFilter(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-100 outline-none"
            >
              <option value="">All rules</option>
              {ruleOptions.map((rule) => (
                <option key={rule} value={rule}>
                  {rule}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Status filter
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-100 outline-none"
            >
              <option value="">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">
        Showing <span className="font-semibold text-slate-100">{filteredProofs.length}</span> proof record(s)
        from the live regulator backend.
      </section>

      <ProofTable proofs={filteredProofs} />
    </div>
  );
}