export type TransactionPayload = {
  tx_id: string;
  sender_id: string;
  receiver_id: string;
  sender_entity_id: number;
  receiver_entity_id: number;
  amount: number;
  currency: string;
  transaction_type: string;
  originator_name: string;
  beneficiary_name: string;
  originator_institution: string;
  beneficiary_institution: string;
  timestamp: string;
};

export type TransactionSubmitResponse = {
  tx_id: string;
  status: string;
  sender_pseudo?: string;
  receiver_pseudo?: string;
  screening_result?: string;
  [key: string]: unknown;
};
