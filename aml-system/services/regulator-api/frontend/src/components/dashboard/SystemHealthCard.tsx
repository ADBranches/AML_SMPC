import { useEffect, useState } from "react";
import { healthApi } from "../../api/healthApi";
import { Card } from "../ui/Card";
import { StatusBadge } from "../ui/StatusBadge";

export function SystemHealthCard() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    healthApi
      .check()
      .then((result) => setStatus(result.status))
      .catch(() => setStatus("unavailable"));
  }, []);

  return (
    <Card>
      <p className="text-xs font-semibold uppercase text-slate-500">Regulator API</p>
      <div className="mt-3 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-950">Backend Health</h3>
        <StatusBadge status={status} />
      </div>
      <p className="mt-3 text-sm text-slate-600">
        Connected to the regulator API used for proofs, verification, and audit retrieval.
      </p>
    </Card>
  );
}
