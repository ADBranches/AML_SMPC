use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct TransactionInput {
    pub tx_id: String,
    pub sender_id: String,
    pub receiver_id: String,
    pub sender_entity_id: Option<i64>,
    pub receiver_entity_id: Option<i64>,
    pub amount: f64,
    pub currency: String,
    pub transaction_type: String,
    pub originator_name: Option<String>,
    pub beneficiary_name: Option<String>,
    pub originator_institution: String,
    pub beneficiary_institution: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PseudonymizedTransaction {
    pub tx_id: String,
    pub sender_pseudo: String,
    pub receiver_pseudo: String,
    pub sender_entity_id: i64,
    pub receiver_entity_id: i64,
    pub amount: f64,
    pub currency: String,
    pub transaction_type: String,
    pub originator_name: Option<String>,
    pub beneficiary_name: Option<String>,
    pub originator_institution: String,
    pub beneficiary_institution: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize)]
pub struct TransactionSubmissionResponse {
    pub tx_id: String,
    pub sender_pseudo: String,
    pub receiver_pseudo: String,
    pub sender_screening_result: String,
    pub receiver_screening_result: String,
    pub status: String,
    pub audit_event_id: String,
}

pub fn pseudonymize_transaction(input: &TransactionInput, salt: &str) -> PseudonymizedTransaction {
    PseudonymizedTransaction {
        tx_id: input.tx_id.clone(),
        sender_pseudo: crate::routes::pseudonymize_identifier(&input.sender_id, salt),
        receiver_pseudo: crate::routes::pseudonymize_identifier(&input.receiver_id, salt),
        sender_entity_id: input
            .sender_entity_id
            .unwrap_or_else(|| crate::routes::derive_entity_id(&input.sender_id)),
        receiver_entity_id: input
            .receiver_entity_id
            .unwrap_or_else(|| crate::routes::derive_entity_id(&input.receiver_id)),
        amount: input.amount,
        currency: input.currency.clone(),
        transaction_type: input.transaction_type.clone(),
        originator_name: input.originator_name.clone(),
        beneficiary_name: input.beneficiary_name.clone(),
        originator_institution: input.originator_institution.clone(),
        beneficiary_institution: input.beneficiary_institution.clone(),
        timestamp: input.timestamp,
    }
}