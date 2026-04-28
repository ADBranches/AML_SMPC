import { NavLink } from "react-router-dom";

const groups = [
  {
    title: "Public",
    links: [
      { to: "/", label: "Home" },
      { to: "/about", label: "About" },
    ],
  },
  {
    title: "Institution",
    links: [
      { to: "/institution/dashboard", label: "Institution Dashboard" },
      { to: "/institution/transactions/new", label: "Submit Transaction" },
      { to: "/institution/screening-results", label: "Screening Results" },
      { to: "/institution/compliance-workflow", label: "Full Workflow" },
      { to: "/institution/he-operations", label: "HE Operations" },
    ],
  },
  {
    title: "Regulator",
    links: [
      { to: "/regulator/dashboard", label: "Regulator Dashboard" },
      { to: "/regulator/proofs", label: "Proofs" },
      { to: "/regulator/audit", label: "Audit" },
      { to: "/regulator/performance", label: "Performance" },
      { to: "/regulator/compliance-report", label: "Compliance Report" },
    ],
  },
  {
    title: "Admin",
    links: [
      { to: "/admin/dashboard", label: "Admin Dashboard" },
      { to: "/admin/services", label: "Services" },
      { to: "/admin/retention", label: "Retention" },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="min-h-screen w-72 overflow-y-auto border-r border-slate-900 bg-slate-950 p-4 text-white">
      <div className="mb-8">
        <div className="text-lg font-bold">AML SMPC</div>
        <p className="mt-1 text-xs text-slate-400">Full Compliance Console</p>
      </div>

      <nav className="space-y-6">
        {groups.map((group) => (
          <section key={group.title}>
            <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}
