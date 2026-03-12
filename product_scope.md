# Product Scope

## Project Name
Privacy-Preserving AML Compliance Prototype

## 1. Product Statement
This project develops a privacy-preserving Anti-Money Laundering (AML) compliance prototype that enables banks to process transactions, perform confidential sanction screening, and generate verifiable compliance evidence aligned to FATF Recommendation 10 (customer due diligence / KYC), FATF Recommendation 11 (record keeping), and FATF Recommendation 16 (payment transparency / travel rule) without unnecessary disclosure of sensitive customer data. [2](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)[3](https://www.youtube.com/watch?v=o8ZfK6yZNWg)[1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)

## 2. Product Vision
The prototype is intended to demonstrate that AML controls can be implemented in a way that preserves customer privacy while still producing auditable and regulator-verifiable outputs. The product should serve two purposes simultaneously:
1. as a final-year academic artifact with clear system design, validation logic, and compliance mapping; and
2. as a demo-ready prototype that can be presented to technical stakeholders, partners, or potential funders as an extensible privacy-preserving compliance platform. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)[2](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)[3](https://www.youtube.com/watch?v=o8ZfK6yZNWg)

## 3. Compliance Alignment
The prototype is aligned to the following regulatory control areas:

- **FATF Recommendation 10** — Customer Due Diligence (CDD/KYC). The prototype demonstrates workflow support for customer-check relevance and due-diligence-related compliance assertions. [2](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)
- **FATF Recommendation 11** — Record Keeping. The prototype stores records and audit references sufficient to support traceability and transaction reconstruction for demonstration purposes. [2](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)
- **FATF Recommendation 16** — Payment Transparency / Travel Rule. The prototype demonstrates that required originator/beneficiary-style metadata can accompany transaction processing and be represented in compliance-oriented proof logic. [3](https://www.youtube.com/watch?v=o8ZfK6yZNWg)

### Important Boundary
This prototype **does not claim full legal or operational certification of FATF compliance**. Instead, it demonstrates privacy-preserving controls and verifiable evidence generation **aligned to** Recommendations 10, 11, and 16. [2](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)[3](https://www.youtube.com/watch?v=o8ZfK6yZNWg)

## 4. Core Technology Scope
The MVP uses the following major technology classes:

- **Secure Multi-Party Computation (SMPC)** for private sanction screening and collaborative checks. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
- **Homomorphic Encryption (HE)** for encrypted transaction arithmetic, especially around amount processing. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
- **Zero-Knowledge / Proof-Oriented Logic** for generating verifiable compliance evidence without revealing full transaction contents. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
- **SoftHSM** for software-based key handling in a Linux environment. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
- **PostgreSQL** for transaction metadata, proof metadata, and audit storage. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
- **k3s** for lightweight Linux-native deployment and orchestration of services. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)

## 5. MVP Scope Rule
The MVP will **not** attempt to implement a full AML platform. The system must prove **one clean, end-to-end privacy-preserving AML transaction flow** from bank submission to regulator verification and audit retrieval. This flow is the core of the product and the foundation for both academic demonstration and funding-oriented presentation. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)[2](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)[3](https://www.youtube.com/watch?v=o8ZfK6yZNWg)

## 6. In-Scope MVP Flow
The MVP is considered successful only if it demonstrates the following sequence:

1. **Bank submits transaction** through the bank-facing system interface or service. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
2. **Identities are pseudonymized** before deeper computation or compliance processing. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
3. **Sanction screening happens privately** using SMPC-based workflow logic. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
4. **Amount logic is handled on encrypted values** using homomorphic encryption. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
5. **A compliance-oriented proof is generated** linking the transaction to due-diligence relevance, record traceability, and payment-metadata presence. [2](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)[3](https://www.youtube.com/watch?v=o8ZfK6yZNWg)[1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
6. **Regulator verifies proof on dashboard** without accessing raw sensitive transaction data. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
7. **Audit trail is stored and retrievable** through the audit/compliance data layer. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)[2](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)

## 7. Functional Scope (In Scope)
The following features are in scope for the MVP:

### 7.1 Transaction Intake
The system accepts a structured transaction containing enough data to support private screening, encrypted arithmetic, traceability, and payment-transparency demonstration. This includes sender/receiver identifiers, amount, transaction metadata, and originator/beneficiary-style fields relevant to Recommendation 16. [3](https://www.youtube.com/watch?v=o8ZfK6yZNWg)[1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)

### 7.2 Pseudonymization Layer
Sensitive identifiers are transformed before core compliance processing so that downstream services operate on privacy-protected representations wherever possible. This supports the project’s GDPR-aligned privacy posture and its broader privacy-preserving architecture. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)

### 7.3 Private Sanction Screening
The system performs sanction or watchlist-oriented matching through SMPC so that screening logic can be executed without broad exposure of underlying inputs. This is a flagship differentiator of the prototype. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)

### 7.4 Encrypted Amount Processing
Transaction amounts are processed through HE-based logic for arithmetic operations such as aggregation or controlled threshold-style evaluation without decrypting values in the main processing path. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)

### 7.5 Compliance Evidence Generation
The system produces a proof or verifiable compliance assertion demonstrating that required workflow steps were completed and that the transaction can be linked to Recommendation 10, Recommendation 11, and Recommendation 16-oriented controls. [2](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)[3](https://www.youtube.com/watch?v=o8ZfK6yZNWg)[1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)

### 7.6 Regulator Verification
A regulator-facing interface verifies the resulting proof and displays relevant metadata such as proof ID, status, timestamp, and audit references without exposing raw transaction details. [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)

### 7.7 Audit and Record Traceability
The system stores transaction references, proof references, verification events, timestamps, and retention-oriented metadata in a way that supports traceability consistent with the record-keeping demonstration goals of Recommendation 11. [2](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)[1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)

## 8. Out of Scope
The following items are explicitly **out of scope** for the MVP and must not delay the main end-to-end flow:

- full banking core integration; [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
- production-grade SWIFT or payment-network integration; [3](https://www.youtube.com/watch?v=o8ZfK6yZNWg)[1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
- complete customer onboarding lifecycle or enterprise KYC platform; [2](https://www.fatf-gafi.org/en/publications/Fatfrecommendations/update-Recommendation-16-payment-transparency-june-2025.html)[1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
- AI/ML transaction-risk scoring engine; [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
- production-scale multi-bank federation; [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
- hardware HSM deployment; [1](blob:https://m365.cloud.microsoft/182bdf44-f1c8-44bf-9c40-b102d894a42b)
