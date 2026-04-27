import os

SCENARIO = os.getenv("PHASE72_SCENARIO", "transactions").strip().lower()

if SCENARIO == "transactions":
    from tests.performance.transactions_load_test import TransactionSubmissionUser

    user_classes = [TransactionSubmissionUser]

elif SCENARIO == "proofs":
    from tests.performance.proof_generation_load_test import ProofGenerationUser

    user_classes = [ProofGenerationUser]

else:
    raise RuntimeError(
        "Invalid PHASE72_SCENARIO. Expected one of: transactions, proofs"
    )
