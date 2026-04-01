import os

def generate_proofs_request():
    return {"tx_id": os.getenv("PERF_PROOF_TX_ID", "TX-E2E-001")}