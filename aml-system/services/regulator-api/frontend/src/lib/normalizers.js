function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

export function normalizeProof(raw = {}) {
  return {
    id: firstDefined(raw.id, raw.proof_id, raw.proofId, 'unknown-proof'),
    txId: firstDefined(raw.tx_id, raw.transaction_id, raw.txId, 'unknown-tx'),
    ruleId: firstDefined(raw.rule_id, raw.rule, raw.ruleId, 'unknown-rule'),
    verificationStatus: String(
      firstDefined(raw.verification_status, raw.status, raw.verificationStatus, 'generated')
    ),
    createdAt: firstDefined(raw.created_at, raw.timestamp, raw.createdAt, ''),
    claimHash: firstDefined(raw.claim_hash, raw.claimHash, ''),
  };
}

export function normalizeProofList(payload) {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.proofs)
      ? payload.proofs
      : Array.isArray(payload?.items)
        ? payload.items
        : [];

  return rows.map(normalizeProof);
}

export function normalizeAuditList(payload) {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.audit)
      ? payload.audit
      : Array.isArray(payload?.items)
        ? payload.items
        : [];

  return rows.map((row, index) => ({
    key: firstDefined(row.id, row.event_id, `${row.created_at || row.timestamp || 'event'}-${index}`),
    eventType: firstDefined(row.event_type, row.type, 'event'),
    eventStatus: firstDefined(row.event_status, row.status, 'unknown'),
    createdAt: firstDefined(row.created_at, row.timestamp, ''),
    eventRef: firstDefined(row.event_ref, row.reference, ''),
    details: firstDefined(row.details, row.payload, row.meta, {}),
  }));
}

export function normalizeVerifyResult(payload = {}) {
  return {
    verified: Boolean(firstDefined(payload.verified, payload.is_verified, false)),
    reason: String(firstDefined(payload.reason, payload.message, '')),
  };
}