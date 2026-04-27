import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/proofs", label: "Proofs" },
  { to: "/audit", label: "Audit" },
  { to: "/performance", label: "Performance" },
  { to: "/about", label: "About" },
];

export function Sidebar() {
  return (
    <aside className="min-h-screen w-64 border-r border-slate-900 bg-slate-950 p-4 text-white">
      <div className="mb-8">
        <div className="text-lg font-bold">AML SMPC</div>
        <p className="mt-1 text-xs text-slate-400">Regulator Console</p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
