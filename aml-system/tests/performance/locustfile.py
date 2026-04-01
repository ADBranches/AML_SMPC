import os
from locust import HttpUser, task, between
from transactions_load_test import submit_transaction_payload
from proof_generation_load_test import generate_proofs_request


class TransactionUser(HttpUser):
    host = os.getenv("ENCRYPTION_SERVICE_BASE_URL", "http://127.0.0.1:8081")
    wait_time = between(0.1, 0.5)

    @task
    def submit_transaction(self):
        payload = submit_transaction_payload()
        self.client.post("/transactions/submit", json=payload, name="POST /transactions/submit")


class ProofUser(HttpUser):
    host = os.getenv("ZK_PROVER_BASE_URL", "http://127.0.0.1:8084")
    wait_time = between(0.1, 0.5)

    @task
    def generate_proofs(self):
        payload = generate_proofs_request()
        self.client.post("/proofs/generate", json=payload, name="POST /proofs/generate")