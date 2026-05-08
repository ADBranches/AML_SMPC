export type PermissionAttribute =
  | "read"
  | "write"
  | "execute"
  | "approve"
  | "verify"
  | "manage";

export function getPermissionAttribute(permission: string): PermissionAttribute {
  if (permission.endsWith(":create")) return "write";
  if (permission.endsWith(":read")) return "read";
  if (permission.endsWith(":read_own")) return "read";
  if (permission.endsWith(":review")) return "read";
  if (permission.endsWith(":approve")) return "approve";
  if (permission.endsWith(":reject")) return "approve";
  if (permission.endsWith(":activate")) return "approve";
  if (permission.endsWith(":deactivate")) return "approve";
  if (permission.endsWith(":assign")) return "approve";
  if (permission.endsWith(":screen")) return "execute";
  if (permission.endsWith(":generate")) return "execute";
  if (permission.endsWith(":verify")) return "verify";
  if (permission.endsWith(":manage")) return "manage";
  if (permission.endsWith(":update")) return "write";
  if (permission.endsWith(":respond")) return "write";
  if (permission.endsWith(":admin")) return "manage";

  return "read";
}

export function describePermissionAttribute(attribute: PermissionAttribute): string {
  switch (attribute) {
    case "read":
      return "Can view records or evidence without changing them.";
    case "write":
      return "Can create or update workflow records.";
    case "execute":
      return "Can run backend workflows such as screening or proof generation.";
    case "approve":
      return "Can approve, reject, activate, deactivate, or assign controlled actions.";
    case "verify":
      return "Can verify proof or evidence correctness.";
    case "manage":
      return "Can administer users, organizations, roles, or platform-wide settings.";
    default:
      return "Permission attribute.";
  }
}

export function attributeBadgeClass(attribute: PermissionAttribute): string {
  switch (attribute) {
    case "read":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "write":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";
    case "execute":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "approve":
      return "border-purple-200 bg-purple-50 text-purple-700";
    case "verify":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "manage":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}
