export function getDevApiKey(): string {
  const fromEnv = import.meta.env.VITE_MYRIAD_KEY;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.trim();
  }
  return "dev-key";
}
