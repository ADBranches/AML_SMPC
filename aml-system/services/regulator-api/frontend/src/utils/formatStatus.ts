export function formatStatus(value?: string) {
  if (!value) return "UNKNOWN";
  return value.replaceAll("_", " ").toUpperCase();
}
