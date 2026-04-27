export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? "AML SMPC Compliance Console",
  regulatorApiBaseUrl: import.meta.env.VITE_REGULATOR_API_BASE_URL ?? "/api/regulator",
  encryptionApiBaseUrl: import.meta.env.VITE_ENCRYPTION_API_BASE_URL ?? "/api/encryption",
  zkProverBaseUrl: import.meta.env.VITE_ZK_PROVER_BASE_URL ?? "/api/zk",
  smpcApiBaseUrl: import.meta.env.VITE_SMPC_API_BASE_URL ?? "/api/smpc",
  heApiBaseUrl: import.meta.env.VITE_HE_API_BASE_URL ?? "/api/he",
};
