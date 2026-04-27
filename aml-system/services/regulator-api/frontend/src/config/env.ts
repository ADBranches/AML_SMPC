export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? "AML SMPC Regulator Console",
  regulatorApiBaseUrl:
    import.meta.env.VITE_REGULATOR_API_BASE_URL ?? "http://127.0.0.1:8085",
  zkProverBaseUrl:
    import.meta.env.VITE_ZK_PROVER_BASE_URL ?? "http://127.0.0.1:8084",
};
