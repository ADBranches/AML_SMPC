import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';

function formatDate(value) {
  try {
    return format(new Date(value), 'yyyy-MM-dd HH:mm:ss');
  } catch {
    return value;
  }
}

export default function ProofTable({ proofs }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/80 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Proof ID</th>
              <th className="px-4 py-3 font-medium">Transaction ID</th>
              <th className="px-4 py-3 font-medium">Rule</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {proofs.map((proof) => (
              <tr key={proof.id} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 font-mono text-xs text-slate-300">{proof.id}</td>
                <td className="px-4 py-3 font-medium">{proof.txId}</td>
                <td className="px-4 py-3">{proof.ruleId}</td>
                <td className="px-4 py-3"><StatusBadge value={proof.verificationStatus} /></td>
                <td className="px-4 py-3 text-slate-400">{formatDate(proof.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/proofs/${proof.id}`}
                    className="inline-flex rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/20"
                  >
                    View proof
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}