export type BankPartyInput = {
  bank_id: string;
  institution_name: string;
  private_customer_refs: string[];
  private_counterparty_refs: string[];
  encrypted_risk_scores: number[];
};

export type ThreeBankSmpcRequest = {
  tx_id: string;
  transaction_amount: number;
  currency: string;
  originator_institution: string;
  beneficiary_institution: string;
  regulator_reference_set_commitment: string;
  parties: BankPartyInput[];
};

export type PartyContributionSummary = {
  bank_id: string;
  institution_name: string;
  private_customer_ref_count: number;
  private_counterparty_ref_count: number;
  encrypted_risk_score_count: number;
  contribution_accepted: boolean;
};

export type ThreeBankSmpcResponse = {
  tx_id: string;
  execution_model: string;
  party_count: number;
  threshold_model: string;
  aggregate_risk_score: number;
  aggregate_risk_level: string;
  possible_cross_bank_overlap_count: number;
  regulator_reference_set_commitment: string;
  raw_bank_inputs_disclosed: boolean;
  screening_status: string;
  party_contributions: PartyContributionSummary[];
  evidence_statement: string;
};

const SMPC_API_BASE =
  (import.meta.env.VITE_SMPC_API_BASE_URL as string | undefined) || "/smpc-api";

export function buildDefaultThreeBankPayload(): ThreeBankSmpcRequest {
  const suffix = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);

  return {
    tx_id: `TX-FE-SMPC-${suffix}`,
    transaction_amount: 750000,
    currency: "USD",
    originator_institution: "Bank A Uganda",
    beneficiary_institution: "Bank B Kenya",
    regulator_reference_set_commitment: "REGULATOR-SANCTIONS-COMMITMENT-2026-Q2",
    parties: [
      {
        bank_id: "bank_a",
        institution_name: "Bank A Uganda",
        private_customer_refs: ["cust_hash_a_001", "cust_hash_a_002"],
        private_counterparty_refs: ["shared_counterparty_hash_777"],
        encrypted_risk_scores: [42, 51],
      },
      {
        bank_id: "bank_b",
        institution_name: "Bank B Kenya",
        private_customer_refs: ["cust_hash_b_001"],
        private_counterparty_refs: ["shared_counterparty_hash_777", "counterparty_hash_b_002"],
        encrypted_risk_scores: [64, 57],
      },
      {
        bank_id: "bank_c",
        institution_name: "Bank C Tanzania",
        private_customer_refs: ["cust_hash_c_001"],
        private_counterparty_refs: ["counterparty_hash_c_002"],
        encrypted_risk_scores: [38, 44],
      },
    ],
  };
}

export async function fetchSmpcStatus(): Promise<unknown> {
  const response = await fetch(`${SMPC_API_BASE}/smpc/status`);

  if (!response.ok) {
    throw new Error(`SMPC status request failed with HTTP ${response.status}`);
  }

  return response.json();
}

export async function runThreeBankSmpcDemo(
  payload: ThreeBankSmpcRequest
): Promise<ThreeBankSmpcResponse> {
  const response = await fetch(`${SMPC_API_BASE}/smpc/three-bank-screen`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  const parsed = body ? JSON.parse(body) : null;

  if (!response.ok) {
    const message =
      parsed?.message ||
      parsed?.error ||
      `Three-bank SMPC request failed with HTTP ${response.status}`;

    throw new Error(message);
  }

  return parsed as ThreeBankSmpcResponse;
}
