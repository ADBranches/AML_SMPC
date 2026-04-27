use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditTimelineItem {
    pub id: String,
    pub tx_id: String,
    pub event_type: String,
    pub event_status: String,
    pub event_ref: Option<String>,
    pub details: serde_json::Value,
    pub created_at: chrono::DateTime<chrono::Utc>,
}