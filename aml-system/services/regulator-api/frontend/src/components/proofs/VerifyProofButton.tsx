type VerifyProofButtonProps = {
  isLoading?: boolean;
  onVerify: () => void;
};

export function VerifyProofButton({
  isLoading = false,
  onVerify,
}: VerifyProofButtonProps) {
  return (
    <button
      type="button"
      onClick={onVerify}
      disabled={isLoading}
      className="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? "Verifying..." : "Verify"}
    </button>
  );
}
