import { env } from "../../config/env";

export function Topbar() {
  return (
    <header className="border-b bg-white px-6 py-4">
      <h1 className="text-xl font-semibold text-slate-900">{env.appName}</h1>
      <p className="text-sm text-slate-500">
        Privacy-preserving AML evidence console
      </p>
    </header>
  );
}
