import type { FormEvent } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type AuditSearchFormProps = {
  txId: string;
  isLoading: boolean;
  onTxIdChange: (value: string) => void;
  onSubmit: () => void;
};

export function AuditSearchForm({
  txId,
  isLoading,
  onTxIdChange,
  onSubmit,
}: AuditSearchFormProps) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <label className="text-sm font-semibold text-slate-700">Transaction ID</label>
      <div className="mt-3 flex flex-col gap-3 md:flex-row">
        <Input value={txId} onChange={(event) => onTxIdChange(event.target.value)} />
        <Button disabled={isLoading} className="md:w-56">
          {isLoading ? "Loading..." : "Load audit timeline"}
        </Button>
      </div>
    </form>
  );
}
