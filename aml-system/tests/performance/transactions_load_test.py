import time
import uuid

def submit_transaction_payload():
    return {
        "tx_id": f"TX-PERF-{int(time.time())}-{uuid.uuid4().hex[:8]}",
        "sender_id": "ACC-001",
        "receiver_id": "ACC-002",
        "sender_entity_id": 1001,
        "receiver_entity_id": 1002,
        "amount": 1250.50,
        "currency": "USD",
        "transaction_type": "wire_transfer",
        "originator_name": "Alice",
        "beneficiary_name": "Bob",
        "originator_institution": "Bank A",
        "beneficiary_institution": "Bank B",
        "timestamp": "2026-03-12T10:00:00Z",
    }
