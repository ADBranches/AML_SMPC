import { NavLink } from "react-router-dom";
import {
  clearStoredSession,
  useAuthSession,
  type UserRole,
} from "../../auth/authStore";

type NavItem = {
  to: string;
  label: string;
};

type NavGroup = {
  title: string;
  roles: UserRole[];
  links: NavItem[];
};

const groups: NavGroup[] = [
  {
    title: "Super Admin",
    roles: ["super_admin"],
    links: [
      { to: "/super-admin/dashboard", label: "Dashboard" },
      { to: "/super-admin/pending-users", label: "Pending Users" },
      { to: "/super-admin/users", label: "User Management" },
      { to: "/super-admin/organizations", label: "Organizations" },
      { to: "/super-admin/roles", label: "Roles & Permissions" },
    ],
  },
  {
    title: "Institution Admin",
    roles: ["institution_admin"],
    links: [
      { to: "/institution/dashboard", label: "Institution Dashboard" },
      { to: "/institution/transactions/new", label: "Submit Transaction" },
      { to: "/institution/transactions", label: "Review Queue" },
      { to: "/institution/transactions/approved", label: "Approved Transactions" },
      { to: "/institution/screening-results", label: "Screening Evidence" },
    ],
  },
  {
    title: "Transaction Submitter",
    roles: ["transaction_submitter"],
    links: [
      { to: "/institution/transactions/new", label: "Submit Transaction" },
      { to: "/institution/transactions", label: "My Transactions" },
    ],
  },
  {
    title: "Transaction Reviewer",
    roles: ["transaction_reviewer"],
    links: [
      { to: "/institution/transactions", label: "Review Queue" },
      { to: "/institution/transactions/approved", label: "Approved Transactions" },
      { to: "/institution/screening-results", label: "Screening Evidence" },
    ],
  },
  {
    title: "Regulator",
    roles: ["regulator"],
    links: [
      { to: "/regulator/dashboard", label: "Regulator Dashboard" },
      { to: "/regulator/proofs", label: "Proofs" },
      { to: "/regulator/audit", label: "Audit" },
      { to: "/regulator/performance", label: "Performance" },
      { to: "/regulator/compliance-report", label: "Compliance Report" },
    ],
  },
  {
    title: "Auditor",
    roles: ["auditor"],
    links: [
      { to: "/regulator/proofs", label: "Proof Evidence" },
      { to: "/regulator/audit", label: "Audit Evidence" },
      { to: "/regulator/compliance-report", label: "Compliance Report" },
    ],
  },
];

export function Sidebar() {
  const session = useAuthSession();

  if (!session) return null;

  const visibleGroups = groups.filter((group) =>
    group.roles.includes(session.role)
  );

  return (
    <aside className="min-h-screen w-72 overflow-y-auto border-r border-slate-900 bg-slate-950 p-4 text-white">
      <div className="mb-8">
        <div className="text-lg font-bold">AML SMPC</div>
        <p className="mt-1 text-xs text-slate-400">
          {session.role.replaceAll("_", " ").toUpperCase()}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500">
          {session.email}
        </p>
      </div>

      <nav className="space-y-6">
        {visibleGroups.map((group) => (
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

      <button
        onClick={clearStoredSession}
        className="mt-8 w-full rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
      >
        Logout
      </button>
    </aside>
  );
}
