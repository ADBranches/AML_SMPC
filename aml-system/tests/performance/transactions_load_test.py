import json
import os
import threading
from pathlib import Path

from locust import HttpUser, task, between, events

ROOT_DIR = Path(__file__).resolve().parents[2]
DATASET_PATH = Path(
    os.getenv(
        "PHASE72_TRANSACTIONS_FILE",
        ROOT_DIR / "tests" / "fixtures" / "performance_transactions.json",
    )
)

TARGET_REQUESTS = int(os.getenv("PHASE72_TOTAL_TRANSACTIONS", "1000"))

_counter_lock = threading.Lock()
_counter = 0
_completed_lock = threading.Lock()
_completed_requests = 0


def load_transactions():
    with DATASET_PATH.open("r", encoding="utf-8") as f:
        payload = json.load(f)
    transactions = payload.get("transactions", [])
    if not transactions:
        raise RuntimeError(f"No transactions found in {DATASET_PATH}")
    return transactions


TRANSACTIONS = load_transactions()


def next_transaction():
    global _counter
    with _counter_lock:
        index = _counter
        _counter += 1

    base = dict(TRANSACTIONS[index % len(TRANSACTIONS)])

    # Keep tx_id unique even if users accidentally exceed 1000 requests.
    if index >= len(TRANSACTIONS):
        base["tx_id"] = f"{base['tx_id']}-R{index}"

    return base


@events.request.add_listener
def stop_after_target(request_type, name, response_time, response_length, exception, context, **kwargs):
    global _completed_requests

    if name != "POST /transactions/submit":
        return

    with _completed_lock:
        _completed_requests += 1
        if _completed_requests >= TARGET_REQUESTS:
            runner = events.request._environment.runner if hasattr(events.request, "_environment") else None
            if runner:
                runner.quit()


class TransactionSubmissionUser(HttpUser):
    wait_time = between(0, 0)

    @task
    def submit_transaction(self):
        payload = next_transaction()

        with self.client.post(
            "/transactions/submit",
            json=payload,
            name="POST /transactions/submit",
            catch_response=True,
            timeout=10,
        ) as response:
            if response.status_code != 201:
                response.failure(f"Expected 201, got {response.status_code}: {response.text[:300]}")
                return

            try:
                body = response.json()
            except Exception as exc:
                response.failure(f"Invalid JSON response: {exc}")
                return

            if body.get("tx_id") != payload["tx_id"]:
                response.failure("Response tx_id mismatch")
                return

            if body.get("status") not in {"screened_clear", "screened_match"}:
                response.failure(f"Unexpected status: {body.get('status')}")
                return

            response.success()
