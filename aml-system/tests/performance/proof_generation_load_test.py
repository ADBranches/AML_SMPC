import os
import threading

from locust import HttpUser, task, between, events

TX_IDS = [
    item.strip()
    for item in os.getenv("PHASE72_PROOF_TX_IDS", "TX-PERF72-PROOF-0001").split(",")
    if item.strip()
]

TARGET_REQUESTS = int(os.getenv("PHASE72_TOTAL_PROOF_REQUESTS", "100"))

_counter_lock = threading.Lock()
_counter = 0
_completed_lock = threading.Lock()
_completed_requests = 0


def next_tx_id():
    global _counter
    with _counter_lock:
        index = _counter
        _counter += 1

    return TX_IDS[index % len(TX_IDS)]


@events.request.add_listener
def stop_after_target(request_type, name, response_time, response_length, exception, context, **kwargs):
    global _completed_requests

    if name != "POST /proofs/generate":
        return

    with _completed_lock:
        _completed_requests += 1
        if _completed_requests >= TARGET_REQUESTS:
            runner = events.request._environment.runner if hasattr(events.request, "_environment") else None
            if runner:
                runner.quit()


class ProofGenerationUser(HttpUser):
    wait_time = between(0, 0)

    @task
    def generate_proof(self):
        tx_id = next_tx_id()

        with self.client.post(
            "/proofs/generate",
            json={"tx_id": tx_id},
            name="POST /proofs/generate",
            catch_response=True,
            timeout=10,
        ) as response:
            if response.status_code != 200:
                response.failure(f"Expected 200, got {response.status_code}: {response.text[:300]}")
                return

            try:
                body = response.json()
            except Exception as exc:
                response.failure(f"Invalid JSON response: {exc}")
                return

            if not isinstance(body, list) or len(body) < 3:
                response.failure("Expected at least 3 proof artifacts")
                return

            expected_rules = {"FATF_REC10", "FATF_REC11", "FATF_REC16"}
            actual_rules = {item.get("rule_id") for item in body}

            if not expected_rules.issubset(actual_rules):
                response.failure(f"Missing expected proof rules: {expected_rules - actual_rules}")
                return

            response.success()
