import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { setStoredSession, type AuthSession } from "../../auth/authStore";
import { dashboardForRole } from "../../auth/roleAccess";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("demo.submitter@example.com");
  const [password, setPassword] = useState("StrongPass123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const session: AuthSession = await authApi.login({ email, password });

      setStoredSession(session);

      const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
      const target = returnTo && returnTo !== "/login"
        ? returnTo
        : dashboardForRole(session.role);

      navigate(target, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Confirm your account is approved and backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="Login"
        description="Approved users log in here to access their role-specific dashboard."
      />

      <Card>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              className="mt-2 w-full rounded-xl border px-4 py-3"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="block text-sm font-semibold">
            Password
            <input
              type="password"
              className="mt-2 w-full rounded-xl border px-4 py-3"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button
            disabled={loading}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {loading ? <div className="mt-4"><LoadingState /></div> : null}
        {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}

        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-bold">Demo approved login:</p>
          <p>Email: demo.submitter@example.com</p>
          <p>Password: StrongPass123</p>
          <p className="mt-2 font-bold">Bootstrap super admin login:</p>
          <p>Email: super.admin@aml-smpc.local</p>
          <p>Password: SuperAdmin123</p>
        </div>

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
