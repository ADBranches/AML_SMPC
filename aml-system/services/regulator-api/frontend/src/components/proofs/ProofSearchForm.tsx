import type { FormEvent } from "react";

type ProofSearchFormProps = {
  txId: string;
  isLoading?: boolean;
  onTxIdChange: (value: string) => void;
  onSubmit: () => void;
};

export function ProofSearchForm({
  txId,
  isLoading = false,
  onTxIdChange,
  onSubmit,
}: ProofSearchFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-white p-4 shadow-sm"
    >
      <label
        htmlFor="tx-id"
        className="text-sm font-semibold text-slate-700"
      >
        Transaction ID
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="tx-id"
          value={txId}
          onChange={(event) => onTxIdChange(event.target.value)}
          placeholder="TX-PHASE73-R16-001"
          className="min-h-11 flex-1 rounded-xl border px-4 text-sm outline-none focus:border-slate-500"
        />
        <button
          type="submit"
          disabled={isLoading || txId.trim().length === 0}
          className="rounded-xl bg-slate-950 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Searching..." : "Search proofs"}
        </button>
      </div>
    </form>
  );
}
