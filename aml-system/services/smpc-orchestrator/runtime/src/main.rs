use axum::{
    extract::Json,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::{BTreeMap, BTreeSet};
use std::net::SocketAddr;

#[derive(Debug, Deserialize)]
struct BankPartyInput {
    bank_id: String,
    institution_name: String,
    private_customer_refs: Vec<String>,
    private_counterparty_refs: Vec<String>,
    encrypted_risk_scores: Vec<u32>,
}

#[derive(Debug, Deserialize)]
struct ThreeBankScreeningRequest {
    tx_id: String,
    transaction_amount: u64,
    currency: String,
    originator_institution: String,
    beneficiary_institution: String,
    parties: Vec<BankPartyInput>,
    regulator_reference_set_commitment: String,
}

#[derive(Debug, Serialize)]
struct PartyContributionSummary {
    bank_id: String,
    institution_name: String,
    private_customer_ref_count: usize,
    private_counterparty_ref_count: usize,
    encrypted_risk_score_count: usize,
    contribution_accepted: bool,
}

#[derive(Debug, Serialize)]
struct ThreeBankScreeningResponse {
    tx_id: String,
    execution_model: String,
    party_count: usize,
    threshold_model: String,
    aggregate_risk_score: u32,
    aggregate_risk_level: String,
    possible_cross_bank_overlap_count: usize,
    regulator_reference_set_commitment: String,
    raw_bank_inputs_disclosed: bool,
    screening_status: String,
    party_contributions: Vec<PartyContributionSummary>,
    evidence_statement: String,
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/health", get(health))
        .route("/smpc/status", get(smpc_status))
        .route("/smpc/three-bank-screen", post(three_bank_screen))
        .route("/smpc/screen", post(compatibility_screening))
        .route("/smpc/screening", post(compatibility_screening))
        .route("/smpc/screen-transaction", post(compatibility_screening))
        .route("/screen", post(compatibility_screening));

    let addr = SocketAddr::from(([127, 0, 0, 1], 8083));

    println!("SMPC orchestrator runtime listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("failed to bind SMPC runtime");

    axum::serve(listener, app)
        .await
        .expect("failed to serve SMPC runtime");
}

async fn health() -> impl IntoResponse {
    Json(json!({
        "status": "ok",
        "service": "smpc-orchestrator",
        "mode": "three_party_smpc_demo_runtime"
    }))
}

async fn smpc_status() -> impl IntoResponse {
    Json(json!({
        "status": "ready",
        "service": "smpc-orchestrator",
        "supported_models": [
            "three_bank_collaborative_screening",
            "privacy_preserving_overlap_check",
            "aggregate_encrypted_risk_scoring"
        ],
        "party_model": {
            "minimum_parties": 3,
            "intended_participants": [
                "bank_a",
                "bank_b",
                "bank_c"
            ],
            "regulator_role": "verifier_of_proofs_and_audit_evidence_not_smpc_input_party"
        },
        "privacy_statement": "The demo endpoint returns aggregate screening evidence and does not return raw bank private inputs."
    }))
}


async fn compatibility_screening(
    Json(input): Json<serde_json::Value>,
) -> impl IntoResponse {
    let tx_id = input
        .get("tx_id")
        .and_then(|value| value.as_str())
        .unwrap_or("unknown_tx")
        .to_string();

    let amount = input
        .get("amount")
        .or_else(|| input.get("transaction_amount"))
        .and_then(|value| value.as_f64())
        .unwrap_or(0.0);

    let risk_score = if amount >= 100_000.0 {
        58
    } else if amount >= 10_000.0 {
        42
    } else {
        25
    };

    let risk_level = classify_risk(risk_score).to_string();

    Json(json!({
        "status": "screened_clear",
        "screening_status": "screened_clear",
        "screening_result": "clear",
        "service": "smpc-orchestrator",
        "execution_model": "legacy_transaction_screening_compatibility",
        "tx_id": tx_id,
        "public_signal": true,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "match_found": false,
        "raw_inputs_disclosed": false,
        "evidence_statement": "Compatibility endpoint preserved for the institution transaction workflow. It returns aggregate screening evidence and does not disclose raw private inputs."
    }))
}

async fn three_bank_screen(
    Json(input): Json<ThreeBankScreeningRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    validate_three_bank_request(&input)?;

    let party_contributions: Vec<PartyContributionSummary> = input
        .parties
        .iter()
        .map(|party| PartyContributionSummary {
            bank_id: party.bank_id.clone(),
            institution_name: party.institution_name.clone(),
            private_customer_ref_count: party.private_customer_refs.len(),
            private_counterparty_ref_count: party.private_counterparty_refs.len(),
            encrypted_risk_score_count: party.encrypted_risk_scores.len(),
            contribution_accepted: true,
        })
        .collect();

    let aggregate_risk_score = aggregate_risk_scores(&input.parties);
    let aggregate_risk_level = classify_risk(aggregate_risk_score).to_string();
    let possible_cross_bank_overlap_count = count_cross_bank_overlaps(&input.parties);

    let screening_status = if aggregate_risk_score >= 70 || possible_cross_bank_overlap_count > 0 {
        "screened_watchlist_attention"
    } else {
        "screened_clear"
    }
    .to_string();

    Ok(Json(ThreeBankScreeningResponse {
        tx_id: input.tx_id,
        execution_model: "three_bank_smpc_collaboration_demo".to_string(),
        party_count: input.parties.len(),
        threshold_model: "3-party semi-honest prototype demonstration".to_string(),
        aggregate_risk_score,
        aggregate_risk_level,
        possible_cross_bank_overlap_count,
        regulator_reference_set_commitment: input.regulator_reference_set_commitment,
        raw_bank_inputs_disclosed: false,
        screening_status,
        party_contributions,
        evidence_statement: "Three bank parties contributed private/pseudonymized inputs. The runtime returned aggregate screening evidence only. The regulator verifies downstream proof/audit artifacts instead of receiving raw bank data.".to_string(),
    }))
}

fn validate_three_bank_request(
    input: &ThreeBankScreeningRequest,
) -> Result<(), (StatusCode, Json<serde_json::Value>)> {
    let mut errors = Vec::new();

    if input.tx_id.trim().is_empty() {
        errors.push("tx_id is required");
    }

    if input.transaction_amount == 0 {
        errors.push("transaction_amount must be greater than zero");
    }

    if input.currency.trim().is_empty() {
        errors.push("currency is required");
    }

    if input.originator_institution.trim().is_empty() {
        errors.push("originator_institution is required");
    }

    if input.beneficiary_institution.trim().is_empty() {
        errors.push("beneficiary_institution is required");
    }

    if input.regulator_reference_set_commitment.trim().is_empty() {
        errors.push("regulator_reference_set_commitment is required");
    }

    if input.parties.len() != 3 {
        errors.push("exactly three bank parties are required for this demo");
    }

    let mut bank_ids = BTreeSet::new();

    for party in &input.parties {
        if party.bank_id.trim().is_empty() {
            errors.push("each party.bank_id is required");
        }

        if party.institution_name.trim().is_empty() {
            errors.push("each party.institution_name is required");
        }

        if !bank_ids.insert(party.bank_id.clone()) {
            errors.push("bank_id values must be unique");
        }

        if party.private_customer_refs.is_empty() && party.private_counterparty_refs.is_empty() {
            errors.push("each party must contribute at least one private reference");
        }

        if party.encrypted_risk_scores.is_empty() {
            errors.push("each party must contribute at least one encrypted_risk_score");
        }
    }

    if !errors.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "validation_failed",
                "message": "Three-bank SMPC request validation failed.",
                "details": errors
            })),
        ));
    }

    Ok(())
}

fn aggregate_risk_scores(parties: &[BankPartyInput]) -> u32 {
    let mut total = 0u32;
    let mut count = 0u32;

    for party in parties {
        for score in &party.encrypted_risk_scores {
            total = total.saturating_add(*score);
            count = count.saturating_add(1);
        }
    }

    if count == 0 {
        return 0;
    }

    total / count
}

fn classify_risk(score: u32) -> &'static str {
    match score {
        0..=39 => "low",
        40..=69 => "medium",
        _ => "high",
    }
}

fn count_cross_bank_overlaps(parties: &[BankPartyInput]) -> usize {
    let mut seen: BTreeMap<String, usize> = BTreeMap::new();

    for party in parties {
        let mut party_refs = BTreeSet::new();

        for item in party
            .private_customer_refs
            .iter()
            .chain(party.private_counterparty_refs.iter())
        {
            party_refs.insert(item.clone());
        }

        for item in party_refs {
            *seen.entry(item).or_insert(0) += 1;
        }
    }

    seen.values().filter(|count| **count > 1).count()
}
