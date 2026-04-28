import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function TransactionReviewQueuePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Review Queue"
        description="Reviewer workspace for checking submitted transactions before approval, screening, proof generation, and regulator visibility."
      />

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-950">Review workflow boundary</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This route is now restricted to institution_admin and transaction_reviewer.
              The next backend phase will connect this queue to submitted transaction records,
              approval/rejection decisions, and proof-generation triggers.
            </p>
          </div>

          <StatusBadge status="RBAC_PROTECTED" />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/institution/screening-results"
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            View Screening Evidence
          </Link>
        </div>
      </Card>
    </div>
  );
}
