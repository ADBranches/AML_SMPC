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
    <aside className="min-h-screen w-64 border-r bg-slate-950 p-4 text-white">
      <div className="mb-8 text-lg font-bold">AML SMPC</div>
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm ${
                isActive
                  ? "bg-white text-slate-950"
                  : "text-slate-300 hover:bg-slate-800"
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
