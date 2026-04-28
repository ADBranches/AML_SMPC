import { Link, Outlet } from "react-router-dom";
import { useAuthSession } from "../auth/authStore";
import { Sidebar } from "../components/navigation/Sidebar";
import { Topbar } from "../components/navigation/Topbar";

export function AppLayout() {
  const session = useAuthSession();

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b bg-white px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <Link to="/" className="text-lg font-black text-slate-950">
              AML SMPC
            </Link>

            <nav className="flex items-center gap-3 text-sm font-semibold">
              <Link to="/" className="rounded-xl px-3 py-2 hover:bg-slate-100">
                Home
              </Link>
              <Link to="/about" className="rounded-xl px-3 py-2 hover:bg-slate-100">
                About
              </Link>
              <Link to="/login" className="rounded-xl px-3 py-2 hover:bg-slate-100">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-slate-950 px-4 py-2 text-white"
              >
                Register
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-6">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <section className="flex-1 p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
