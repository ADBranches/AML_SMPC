import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/navigation/Sidebar";
import { Topbar } from "../components/navigation/Topbar";

export function AppLayout() {
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
