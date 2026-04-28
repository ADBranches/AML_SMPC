import { useState } from "react";
import { heApi } from "../../api/heApi";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { JsonViewer } from "../../components/ui/JsonViewer";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";

export function HeOperationsPage() {
  const [amountA, setAmountA] = useState(1250);
  const [amountB, setAmountB] = useState(750);
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runHeFlow() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      if (amountA <= 0 || amountB <= 0) {
        throw new Error("Both HE input amounts must be greater than zero.");
      }

      const encryptedA = await heApi.encrypt(amountA);
      const encryptedB = await heApi.encrypt(amountB);
      const summed = await heApi.sum(
        encryptedA.ciphertext_hex,
        encryptedB.ciphertext_hex
      );
      const decrypted = await heApi.decryptTest(summed.result_ciphertext_hex);

      setResult({
        amount_a: amountA,
        amount_b: amountB,
        expected_sum: amountA + amountB,
        decrypted_test_sum: decrypted.amount,
        encrypted_a_preview: encryptedA.ciphertext_hex.slice(0, 120),
        encrypted_b_preview: encryptedB.ciphertext_hex.slice(0, 120),
        encrypted_sum_preview: summed.result_ciphertext_hex.slice(0, 120),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "HE operation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="HE Operations"
        description="Run real homomorphic encryption gateway operations: encrypt amount, sum encrypted values, and decrypt-test the result for demo validation."
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="font-bold">Encrypted Amount Inputs</h3>

          <label className="block text-sm font-semibold">
            Amount A
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              type="number"
              value={amountA}
              onChange={(event) => setAmountA(Number(event.target.value))}
            />
          </label>

          <label className="block text-sm font-semibold">
            Amount B
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              type="number"
              value={amountB}
              onChange={(event) => setAmountB(Number(event.target.value))}
            />
          </label>

          <button
            onClick={runHeFlow}
            disabled={loading}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Running HE Flow..." : "Run HE Encrypt + Sum"}
          </button>
        </Card>

        <Card>
          <h3 className="mb-3 font-bold">HE Output</h3>
          {loading ? <LoadingState /> : null}
          {error ? <ErrorBanner message={error} /> : null}
          <JsonViewer value={result ?? { message: "Run the HE flow to see ciphertext output." }} />
        </Card>
      </section>
    </div>
  );
}
