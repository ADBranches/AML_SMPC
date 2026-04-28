import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";

export function LoginPage() {
  const [message, setMessage] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    setMessage(
      "Backend authentication is the next implementation phase. For now, protected dashboards are blocked until JWT login is connected."
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="Login"
        description="Approved users will log in here to access their role-specific dashboard."
      />

      <Card>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              className="mt-2 w-full rounded-xl border px-4 py-3"
              placeholder="user@example.com"
            />
          </label>

          <label className="block text-sm font-semibold">
            Password
            <input
              type="password"
              className="mt-2 w-full rounded-xl border px-4 py-3"
              placeholder="********"
            />
          </label>

          <button className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
            Login
          </button>
        </form>

        {message ? (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            {message}
          </div>
        ) : null}

        <p className="mt-4 text-sm text-slate-600">
          No account yet?{" "}
          <Link to="/register" className="font-semibold text-slate-950">
            Request access
          </Link>
        </p>
      </Card>
    </div>
  );
}
