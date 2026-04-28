import { useMemo, useState } from "react";
import { auditApi } from "../../api/auditApi";
import { ApiError } from "../../api/client";
import { heApi } from "../../api/heApi";
import { proofGenerationApi } from "../../api/proofGenerationApi";
import { proofsApi } from "../../api/proofsApi";
import { transactionsApi } from "../../api/transactionsApi";
import { AuditTimeline } from "../../components/audit/AuditTimeline";
import { Card } from "../../components/ui/Card";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { JsonViewer } from "../../components/ui/JsonViewer";
import { LoadingState } from "../../components/ui/LoadingState";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { AuditEvent } from "../../types/audit";
import type { ProofRow, VerifyProofResponse } from "../../types/proof";
import type { TransactionPayload, TransactionSubmitResponse } from "../../types/transaction";

type WorkflowMode = "dynamic" | "quick_demo";

type WorkflowStep = {
  label: string;
  status: "pending" | "running" | "passed" | "failed";
  detail?: string;
};

function generateTxId() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TX-DYNAMIC-${stamp}-${suffix}`;
}

function createPayload(txId: string): TransactionPayload {
  return {
    tx_id: txId,
    sender_id: "DYNAMIC-SENDER-1001",
    receiver_id: "DYNAMIC-RECEIVER-2002",
    sender_entity_id: 1001,
    receiver_entity_id: 2002,
    amount: 1250,
    currency: "USD",
    transaction_type: "wire_transfer",
    originator_name: "Synthetic Dynamic Sender",
    beneficiary_name: "Synthetic Dynamic Receiver",
    originator_institution: "Dynamic Origin Bank",
    beneficiary_institution: "Dynamic Beneficiary Bank",
    timestamp: new Date().toISOString(),
  };
}

function validatePayload(payload: TransactionPayload): string[] {
  const errors: string[] = [];

  if (!payload.tx_id.trim()) errors.push("Transaction ID is required.");
  if (!payload.sender_id.trim()) errors.push("Sender ID is required.");
  if (!payload.receiver_id.trim()) errors.push("Receiver ID is required.");
  if (!payload.currency.trim()) errors.push("Currency is required.");
  if (!payload.transaction_type.trim()) errors.push("Transaction type is required.");
  if (!payload.originator_institution.trim()) errors.push("Originator institution is required.");
  if (!payload.beneficiary_institution.trim()) errors.push("Beneficiary institution is required.");
  if (payload.amount <= 0) errors.push("Amount must be greater than zero.");
  if (payload.sender_entity_id <= 0) errors.push("Sender entity ID must be positive.");
  if (payload.receiver_entity_id <= 0) errors.push("Receiver entity ID must be positive.");

  return errors;
}

export function ComplianceWorkflowPage() {
  const firstTxId = useMemo(() => generateTxId(), []);
  const [mode, setMode] = useState<WorkflowMode>("dynamic");
  const [payload, setPayload] = useState<TransactionPayload>(() => createPayload(firstTxId));
  const [heAmountB, setHeAmountB] = useState(750);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [submission, setSubmission] = useState<TransactionSubmitResponse | null>(null);
  const [heResult, setHeResult] = useState<unknown>(null);
  const [proofGeneration, setProofGeneration] = useState<unknown>(null);
  const [proofs, setProofs] = useState<ProofRow[]>([]);
  const [verificationResults, setVerificationResults] = useState<VerifyProofResponse[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  const [steps, setSteps] = useState<WorkflowStep[]>([
    { label: "Validate transaction input", status: "pending" },
    { label: "Run HE amount operation", status: "pending" },
    { label: "Submit transaction and run SMPC screening", status: "pending" },
    { label: "Generate FATF proofs", status: "pending" },
    { label: "Retrieve regulator proofs", status: "pending" },
    { label: "Verify proof artifacts", status: "pending" },
    { label: "Retrieve audit timeline", status: "pending" },
  ]);

  function updateStep(index: number, patch: Partial<WorkflowStep>) {
    setSteps((current) =>
      current.map((step, currentIndex) =>
        currentIndex === index ? { ...step, ...patch } : step
      )
    );
  }

  function resetOutputs() {
    setSubmission(null);
    setHeResult(null);
    setProofGeneration(null);
    setProofs([]);
    setVerificationResults([]);
    setAuditEvents([]);
    setError("");
    setSteps((current) =>
      current.map((step) => ({ ...step, status: "pending", detail: undefined }))
    );
  }

  function generateFreshPayload() {
    setPayload(createPayload(generateTxId()));
    resetOutputs();
  }

  function update<K extends keyof TransactionPayload>(key: K, value: TransactionPayload[K]) {
    setPayload((current) => ({ ...current, [key]: value }));
  }

  async function runFullDynamicWorkflow() {
    resetOutputs();
    setLoading(true);

    try {
      const activePayload =
        mode === "quick_demo"
          ? { ...createPayload("TX-PHASE73-R16-001"), tx_id: "TX-PHASE73-R16-001" }
          : { ...payload, timestamp: new Date().toISOString() };

      setPayload(activePayload);

      updateStep(0, { status: "running" });
      const validationErrors = validatePayload(activePayload);

      if (validationErrors.length > 0) {
        updateStep(0, { status: "failed", detail: validationErrors.join(" ") });
        throw new Error(validationErrors.join(" "));
      }

      updateStep(0, { status: "passed", detail: "Input validation passed." });

      updateStep(1, { status: "running" });
      const heA = await heApi.encrypt(activePayload.amount);
      const heB = await heApi.encrypt(heAmountB);
      const heSum = await heApi.sum(heA.ciphertext_hex, heB.ciphertext_hex);
      const heDecrypted = await heApi.decryptTest(heSum.result_ciphertext_hex);

      setHeResult({
        amount_a: activePayload.amount,
        amount_b: heAmountB,
        encrypted_a_preview: heA.ciphertext_hex.slice(0, 80),
        encrypted_b_preview: heB.ciphertext_hex.slice(0, 80),
        encrypted_sum_preview: heSum.result_ciphertext_hex.slice(0, 80),
        decrypted_test_amount: heDecrypted.amount,
      });

      updateStep(1, {
        status: "passed",
        detail: `HE encrypt/sum/decrypt-test completed. Decrypted test amount: ${heDecrypted.amount}`,
      });

      if (mode === "dynamic") {
        updateStep(2, { status: "running" });

        try {
          const response = await transactionsApi.submit(activePayload);
          setSubmission(response);
          updateStep(2, {
            status: "passed",
            detail: `Transaction submitted and screened: ${response.status}`,
          });
        } catch (err) {
          if (err instanceof ApiError && err.status === 409) {
            const retryPayload = {
              ...activePayload,
              tx_id: generateTxId(),
              timestamp: new Date().toISOString(),
            };

            setPayload(retryPayload);
            const retryResponse = await transactionsApi.submit(retryPayload);
            setSubmission(retryResponse);
            activePayload.tx_id = retryPayload.tx_id;

            updateStep(2, {
              status: "passed",
              detail: `Duplicate detected; retried with ${retryPayload.tx_id}`,
            });
          } else {
            updateStep(2, { status: "failed", detail: "Transaction submission failed." });
            throw err;
          }
        }
      } else {
        updateStep(2, {
          status: "passed",
          detail: "Quick Demo Mode uses existing seeded transaction evidence.",
        });
      }

      updateStep(3, { status: "running" });
      const generated = await proofGenerationApi.generateForTransaction(activePayload.tx_id);
      setProofGeneration(generated);
      updateStep(3, {
        status: "passed",
        detail: "FATF proof generation request completed.",
      });

      updateStep(4, { status: "running" });
      const regulatorProofs = await proofsApi.listByTransaction(activePayload.tx_id);
      setProofs(regulatorProofs);

      if (regulatorProofs.length < 3) {
        updateStep(4, {
          status: "failed",
          detail: `Expected at least 3 proofs; got ${regulatorProofs.length}.`,
        });
        throw new Error(`Expected at least 3 proofs; got ${regulatorProofs.length}.`);
      }

      updateStep(4, {
        status: "passed",
        detail: `${regulatorProofs.length} proof artifacts retrieved.`,
      });

      updateStep(5, { status: "running" });
      const verified = await Promise.all(
        regulatorProofs.map((proof) => proofsApi.verifyProof(proof.id))
      );
      setVerificationResults(verified);
      updateStep(5, {
        status: verified.every((item) => item.verified) ? "passed" : "failed",
        detail: `${verified.filter((item) => item.verified).length}/${verified.length} proofs verified.`,
      });

      updateStep(6, { status: "running" });
      const timeline = await auditApi.listByTransaction(activePayload.tx_id);
      setAuditEvents(timeline);

      if (timeline.length < 3) {
        updateStep(6, {
          status: "failed",
          detail: `Expected at least 3 audit events; got ${timeline.length}.`,
        });
        throw new Error(`Expected at least 3 audit events; got ${timeline.length}.`);
      }

      updateStep(6, {
        status: "passed",
        detail: `${timeline.length} audit events retrieved.`,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Workflow failed. Confirm backend services are running."
      );
    } finally {
      setLoading(false);
    }
  }

  const activeTxId = submission?.tx_id ?? payload.tx_id;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Full Dynamic Compliance Workflow"
        description="End-to-end transaction processing: HE operation, SMPC screening, audit logging, FATF proof generation, regulator retrieval, and proof verification."
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-950">Workflow Mode</h3>
            <p className="mt-1 text-sm text-slate-600">
              Dynamic mode proves the real flow. Quick demo mode keeps known evidence available for presentation fallback.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMode("dynamic")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                mode === "dynamic" ? "bg-slate-950 text-white" : "border bg-white"
              }`}
            >
              Dynamic Mode
            </button>
            <button
              onClick={() => setMode("quick_demo")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                mode === "quick_demo" ? "bg-slate-950 text-white" : "border bg-white"
              }`}
            >
              Quick Demo Mode
            </button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold">Transaction Input</h3>
            <button
              onClick={generateFreshPayload}
              className="rounded-xl border px-4 py-2 text-sm font-semibold"
            >
              Generate Fresh Dynamic TX
            </button>
          </div>

          <label className="block text-sm font-semibold">
            Transaction ID
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3 font-mono text-sm"
              value={payload.tx_id}
              onChange={(event) => update("tx_id", event.target.value)}
              disabled={mode === "quick_demo"}
            />
          </label>

          <label className="block text-sm font-semibold">
            Amount A
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              type="number"
              value={payload.amount}
              onChange={(event) => update("amount", Number(event.target.value))}
            />
          </label>

          <label className="block text-sm font-semibold">
            Amount B for HE Sum
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              type="number"
              value={heAmountB}
              onChange={(event) => setHeAmountB(Number(event.target.value))}
            />
          </label>

          <label className="block text-sm font-semibold">
            Sender Entity ID
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              type="number"
              value={payload.sender_entity_id}
              onChange={(event) => update("sender_entity_id", Number(event.target.value))}
            />
          </label>

          <label className="block text-sm font-semibold">
            Receiver Entity ID
            <input
              className="mt-2 w-full rounded-xl border px-4 py-3"
              type="number"
              value={payload.receiver_entity_id}
              onChange={(event) => update("receiver_entity_id", Number(event.target.value))}
            />
          </label>

          <button
            onClick={runFullDynamicWorkflow}
            disabled={loading}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Running Workflow..." : "Run Full Compliance Workflow"}
          </button>
        </Card>

        <Card>
          <h3 className="font-bold">Workflow Steps</h3>
          <div className="mt-4 space-y-3">
            {steps.map((step) => (
              <div key={step.label} className="rounded-xl border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{step.label}</p>
                    {step.detail ? (
                      <p className="mt-1 text-xs text-slate-600">{step.detail}</p>
                    ) : null}
                  </div>
                  <StatusBadge status={step.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-bold">HE Result</h3>
          <JsonViewer value={heResult ?? { message: "Run workflow to see HE output." }} />
        </Card>

        <Card>
          <h3 className="mb-3 font-bold">Transaction Submission</h3>
          <JsonViewer value={submission ?? { tx_id: activeTxId, mode }} />
        </Card>

        <Card>
          <h3 className="mb-3 font-bold">Proof Generation Response</h3>
          <JsonViewer value={proofGeneration ?? { message: "No proof generation response yet." }} />
        </Card>

        <Card>
          <h3 className="mb-3 font-bold">Verification Results</h3>
          <JsonViewer value={verificationResults} />
        </Card>
      </section>

      <Card>
        <h3 className="mb-3 font-bold">Regulator Proofs</h3>
        <JsonViewer value={proofs} />
      </Card>

      <Card>
        <h3 className="mb-3 font-bold">Audit Timeline</h3>
        <AuditTimeline events={auditEvents} />
      </Card>
    </div>
  );
}
