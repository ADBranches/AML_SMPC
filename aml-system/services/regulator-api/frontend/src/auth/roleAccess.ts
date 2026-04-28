import type { UserRole } from "./authStore";

export function dashboardForRole(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "/super-admin/dashboard";

    case "institution_admin":
      return "/institution/dashboard";

    case "transaction_submitter":
      return "/institution/transactions/new";

    case "transaction_reviewer":
      return "/institution/reviews";

    case "regulator":
      return "/regulator/dashboard";

    case "auditor":
      return "/regulator/audit";

    default:
      return "/";
  }
}

export const roleGroups = {
  institutionAll: ["institution_admin", "transaction_submitter", "transaction_reviewer"] as UserRole[],
  institutionManagement: ["institution_admin"] as UserRole[],
  transactionSubmission: ["institution_admin", "transaction_submitter"] as UserRole[],
  transactionReview: ["institution_admin", "transaction_reviewer"] as UserRole[],
  regulatorFull: ["regulator"] as UserRole[],
  regulatorEvidenceReadOnly: ["regulator", "auditor"] as UserRole[],
  superAdmin: ["super_admin"] as UserRole[],
};
