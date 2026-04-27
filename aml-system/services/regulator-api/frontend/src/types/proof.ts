export type ProofRow = {
  id: string;
  tx_id: string;
  rule_id: string;
  claim_hash?: string;
  public_signal: boolean;
  verification_status: string;
  created_at?: string;
};

export type ProofDetail = ProofRow & {
  proof_blob?: Record<string, unknown>;
};

export type VerifyProofResponse = {
  proof_id: string;
  tx_id: string;
  rule_id: string;
  verified: boolean;
  reason: string;
};
