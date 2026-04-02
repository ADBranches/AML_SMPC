import { ShieldCheck, Database, SearchCheck } from 'lucide-react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-sky-500/10 p-2 text-sky-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">AML Regulator Dashboard</h1>
                  <p className="text-sm text-slate-400">
                    Privacy-preserving proof review, verification, and audit linkage.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Database className="h-4 w-4 text-sky-400" />
                  <span className="text-xs uppercase tracking-wide">Data source</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">Live regulator backend API</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <SearchCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs uppercase tracking-wide">Mode</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">Minimal, privacy-friendly review UI</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-violet-400" />
                  <span className="text-xs uppercase tracking-wide">Scope</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">Proof list, detail, verify, audit timeline</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}