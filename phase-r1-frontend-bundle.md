# Phase R1 Frontend Bundle

## `docs/demo/regulator-dashboard-demo.md`

```md
# Regulator Dashboard Demo Guide

## Purpose
This document explains how to run and validate the regulator dashboard locally against the live regulator backend.

## Prerequisites
- backend stack running locally,
- regulator API reachable at the configured base URL,
- frontend dependencies installed.

## Environment
Create `.env` from `.env.example` inside `services/regulator-api/frontend/` if needed.

```bash
VITE_REGULATOR_API_BASE_URL=http://127.0.0.1:8085
```

## Startup

```bash
cd services/regulator-api/frontend
npm install
npm run dev
```

## Demo flow
1. open the dashboard home page,
2. confirm proof list loads,
3. filter by `TX-E2E-001`,
4. open a proof detail page,
5. trigger verification,
6. inspect audit timeline.

## Expected visible data
- proof ID,
- transaction ID,
- rule ID,
- verification status,
- created timestamp,
- ordered audit events.

## Privacy note
The dashboard should not expose raw customer identifiers in normal views.

```

## `docs/research/phase-r1-regulator-frontend-plan.md`

```md
# Phase R1 — Regulator Frontend Completion

## Objective
Build the missing React regulator dashboard so the MVP becomes visibly real and product-complete.

## Why this phase is next
The current regulator backend already supports:

- proof listing through `GET /proofs`,
- proof detail retrieval through `GET /proofs/:proof_id`,
- proof verification through `POST /proofs/:proof_id/verify`,
- audit timeline retrieval through `GET /audit/:tx_id`.

This frontend phase therefore builds directly on real backend APIs.

## Chosen frontend stack
- React
- Vite
- JSX (not TypeScript)
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- Lucide React
- clsx
- date-fns

## Frontend scope
The dashboard must support:

1. proof list page,
2. proof detail page,
3. verify action,
4. audit timeline rendering,
5. privacy-friendly display of proof-linked compliance information.

## Micro Timeline

### R1.A — Scaffold
- create frontend folder and package metadata
- configure Vite
- configure Tailwind
- create router shell
- add environment example

### R1.B — Shared foundations
- create API client
- create shared layout shell
- create badge, loading, error, and table helpers

### R1.C — Proof list page
- fetch proofs
- render proof table
- filter by transaction ID / rule ID / status

### R1.D — Proof detail page
- fetch proof by ID
- show proof metadata
- hide raw customer identifiers

### R1.E — Verify action
- trigger proof verification
- update visible verification result

### R1.F — Audit timeline
- fetch and render audit entries linked to transaction ID

### R1.G — Minimal UX pass
- clean table-based layout
- no unnecessary animation or design-system work

### R1.H — Validation
- run local frontend
- connect to live backend
- verify proof list, detail, verification, and audit timeline manually

## Acceptance criteria
Phase R1 is complete only if:
- proof list loads from live backend,
- proof detail works,
- verify action works,
- audit timeline renders,
- all shown data comes from real APIs,
- the UI remains privacy-friendly and avoids raw customer identifiers.

```

## `services/regulator-api/frontend/.env.example`

```text
VITE_REGULATOR_API_BASE_URL=http://127.0.0.1:8085

```

## `services/regulator-api/frontend/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AML Regulator Dashboard</title>
  </head>
  <body class="bg-slate-950 text-slate-100">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```

## `services/regulator-api/frontend/package.json`

```json
{
  "name": "aml-regulator-dashboard",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.66.8",
    "axios": "^1.8.4",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.484.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "vite": "^6.2.3"
  }
}

```

## `services/regulator-api/frontend/postcss.config.js`

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

```

## `services/regulator-api/frontend/src/App.jsx`

```jsx
import { Outlet } from 'react-router-dom';
import Layout from './components/Layout';

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

```

## `services/regulator-api/frontend/src/components/AuditTimeline.jsx`

```jsx
import { format } from 'date-fns';

function formatDate(value) {
  try {
    return format(new Date(value), 'yyyy-MM-dd HH:mm:ss');
  } catch {
    return value;
  }
}

export default function AuditTimeline({ items }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Audit timeline</h3>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="mt-1 h-3 w-3 rounded-full bg-sky-400" />
            <div className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-slate-100">{item.event_type}</p>
                  <p className="text-xs text-slate-400">status: {item.event_status}</p>
                </div>
                <div className="text-xs text-slate-500">{formatDate(item.created_at)}</div>
              </div>
              {item.event_ref ? <p className="mt-3 text-xs text-slate-400">event_ref: {item.event_ref}</p> : null}
              <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-3 text-xs text-slate-300">
{JSON.stringify(item.details, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

```

## `services/regulator-api/frontend/src/components/ErrorState.jsx`

```jsx
export default function ErrorState({ title = 'Something went wrong', detail }) {
  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-200">
      <h2 className="text-base font-semibold">{title}</h2>
      {detail ? <pre className="mt-3 overflow-auto whitespace-pre-wrap text-xs text-rose-100">{detail}</pre> : null}
    </div>
  );
}

```

## `services/regulator-api/frontend/src/components/Layout.jsx`

```jsx
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

```

## `services/regulator-api/frontend/src/components/LoadingState.jsx`

```jsx
export default function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
        <span>{label}</span>
      </div>
    </div>
  );
}

```

## `services/regulator-api/frontend/src/components/ProofTable.jsx`

```jsx
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
                <td className="px-4 py-3 font-medium">{proof.tx_id}</td>
                <td className="px-4 py-3">{proof.rule_id}</td>
                <td className="px-4 py-3"><StatusBadge value={proof.verification_status} /></td>
                <td className="px-4 py-3 text-slate-400">{formatDate(proof.created_at)}</td>
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

```

## `services/regulator-api/frontend/src/components/StatusBadge.jsx`

```jsx
import clsx from 'clsx';

export default function StatusBadge({ value }) {
  const normalized = String(value || '').toLowerCase();

  const color = clsx(
    'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
    normalized === 'verified' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    normalized === 'generated' && 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    normalized === 'failed' && 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    !['verified', 'generated', 'failed'].includes(normalized) &&
      'border-slate-700 bg-slate-800 text-slate-300'
  );

  return <span className={color}>{value || 'unknown'}</span>;
}

```

## `services/regulator-api/frontend/src/lib/api.js`

```js
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_REGULATOR_API_BASE_URL || 'http://127.0.0.1:8085';

export const api = axios.create({
  baseURL: apiBaseUrl.replace(/\/$/, ''),
  timeout: 10000,
});

export async function fetchProofs(params = {}) {
  const response = await api.get('/proofs', { params });
  return response.data;
}

export async function fetchProofById(proofId) {
  const response = await api.get(`/proofs/${proofId}`);
  return response.data;
}

export async function verifyProof(proofId) {
  const response = await api.post(`/proofs/${proofId}/verify`);
  return response.data;
}

export async function fetchAuditTimeline(txId) {
  const response = await api.get(`/audit/${txId}`);
  return response.data;
}

```

## `services/regulator-api/frontend/src/main.jsx`

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

```

## `services/regulator-api/frontend/src/pages/NotFoundPage.jsx`

```jsx
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

```

## `services/regulator-api/frontend/src/pages/ProofDetailPage.jsx`

```jsx
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

  const txId = proofQuery.data?.tx_id;

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

  const proof = proofQuery.data;

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
              <h2 className="mt-2 text-xl font-semibold text-slate-100">{proof.rule_id}</h2>
              <p className="mt-2 font-mono text-xs text-slate-500">{proof.id}</p>
            </div>
            <StatusBadge value={verificationResult?.verified ? 'verified' : proof.verification_status} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Transaction ID</p>
              <p className="mt-2 text-sm font-medium text-slate-100">{proof.tx_id}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Created</p>
              <p className="mt-2 text-sm font-medium text-slate-100">{formatDate(proof.created_at)}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">Claim hash</p>
              <p className="mt-2 break-all font-mono text-xs text-slate-300">{proof.claim_hash}</p>
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
              <p className="mt-2">verified: <span className="font-semibold">{String(verificationResult.verified)}</span></p>
              <p className="mt-2 break-words text-slate-400">reason: {verificationResult.reason}</p>
            </div>
          ) : null}
        </div>
      </section>

      {auditQuery.isLoading ? <LoadingState label="Loading audit timeline..." /> : null}
      {auditQuery.isError ? <ErrorState title="Failed to load audit timeline" detail={auditQuery.error?.message} /> : null}
      {Array.isArray(auditQuery.data) ? <AuditTimeline items={auditQuery.data} /> : null}
    </div>
  );
}

```

## `services/regulator-api/frontend/src/pages/ProofListPage.jsx`

```jsx
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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['proofs'],
    queryFn: () => fetchProofs(),
  });

  const filteredProofs = useMemo(() => {
    const proofs = Array.isArray(data) ? data : [];
    return proofs.filter((proof) => {
      const matchesTx = txIdFilter ? proof.tx_id.toLowerCase().includes(txIdFilter.toLowerCase()) : true;
      const matchesRule = ruleFilter ? proof.rule_id === ruleFilter : true;
      const matchesStatus = statusFilter ? proof.verification_status === statusFilter : true;
      return matchesTx && matchesRule && matchesStatus;
    });
  }, [data, txIdFilter, ruleFilter, statusFilter]);

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
              <option value="FATF_REC10">FATF_REC10</option>
              <option value="FATF_REC11">FATF_REC11</option>
              <option value="FATF_REC16">FATF_REC16</option>
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
              <option value="generated">generated</option>
              <option value="verified">verified</option>
              <option value="failed">failed</option>
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

```

## `services/regulator-api/frontend/src/router.jsx`

```jsx
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import ProofListPage from './pages/ProofListPage';
import ProofDetailPage from './pages/ProofDetailPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <ProofListPage />,
      },
      {
        path: 'proofs/:proofId',
        element: <ProofDetailPage />,
      },
    ],
  },
]);

```

## `services/regulator-api/frontend/src/styles/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  @apply bg-slate-950 text-slate-100 min-h-screen;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

a {
  @apply text-sky-400 hover:text-sky-300;
}

```

## `services/regulator-api/frontend/tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0b1220',
        panel: '#111827',
        border: '#1f2937',
      },
    },
  },
  plugins: [],
};

```

## `services/regulator-api/frontend/vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
});

```

## `tests/frontend/README.md`

```md
# Frontend Validation Notes (Phase R1)

This folder documents how to validate the regulator frontend manually during Phase R1.

## Manual smoke validation

1. start the regulator backend,
2. start the frontend,
3. open the dashboard,
4. confirm proof list loads,
5. open one proof detail page,
6. trigger proof verification,
7. confirm audit timeline renders.

## Expected visible fields
- proof ID,
- transaction ID,
- rule ID,
- verification status,
- created timestamp,
- audit event list.

## Privacy expectation
The frontend must avoid exposing raw customer identifiers in normal regulator views.

```
