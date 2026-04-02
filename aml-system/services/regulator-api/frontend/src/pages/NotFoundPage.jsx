import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
      <h2 className="text-2xl font-semibold text-slate-100">Page not found</h2>
      <p className="mt-3 text-sm text-slate-400">The requested dashboard page does not exist.</p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-300 hover:bg-sky-500/20"
      >
        Go to proof list
      </Link>
    </div>
  );
}