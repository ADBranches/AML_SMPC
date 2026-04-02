import axios from 'axios';
import {
  normalizeAuditList,
  normalizeProof,
  normalizeProofList,
  normalizeVerifyResult,
} from './normalizers';

const apiBaseUrl = import.meta.env.VITE_REGULATOR_API_BASE_URL || 'http://127.0.0.1:8085';

export const api = axios.create({
  baseURL: apiBaseUrl.replace(/\/$/, ''),
  timeout: 10000,
});

export async function fetchProofs(params = {}) {
  const response = await api.get('/proofs', { params });
  return normalizeProofList(response.data);
}

export async function fetchProofById(proofId) {
  const response = await api.get(`/proofs/${proofId}`);
  return normalizeProof(response.data);
}

export async function verifyProof(proofId) {
  const response = await api.post(`/proofs/${proofId}/verify`);
  return normalizeVerifyResult(response.data);
}

export async function fetchAuditTimeline(txId) {
  const response = await api.get(`/audit/${txId}`);
  return normalizeAuditList(response.data);
}