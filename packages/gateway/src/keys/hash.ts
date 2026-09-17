export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashSecret(secret: string, pepper?: string): Promise<string> {
  return sha256Hex(pepper ? `${pepper}:${secret}` : secret);
}

export function generateSecret(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `sk-myriad-${hex}`;
}

export function describeSecret(secret: string): { prefix: string; last4: string } {
  return {
    prefix: secret.slice(0, 14),
    last4: secret.slice(-4),
  };
}

export function newKeyId(): string {
  return `key_${crypto.randomUUID().slice(0, 8)}`;
}
