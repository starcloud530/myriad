export interface LocalKey {
  id: string;
  tag: string;
  description: string;
  secret: string;
  createdAt: string;
  status: "active" | "disabled";
}

const storageKey = "myriad.keys.v1";

function randomId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function generateSecret(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `sk-myriad-${hex}`;
}

export function maskSecret(secret: string): string {
  if (secret.length <= 12) {
    return secret;
  }
  return `${secret.slice(0, 10)}••••${secret.slice(-4)}`;
}

export function loadLocalKeys(): LocalKey[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((row): row is LocalKey => {
      return (
        row != null &&
        typeof row === "object" &&
        typeof (row as LocalKey).id === "string" &&
        typeof (row as LocalKey).secret === "string"
      );
    });
  } catch {
    return [];
  }
}

export function saveLocalKeys(keys: LocalKey[]): void {
  localStorage.setItem(storageKey, JSON.stringify(keys));
}

export function createLocalKey(input: { tag: string; description: string }): LocalKey {
  const next: LocalKey = {
    id: `key_${randomId()}`,
    tag: input.tag.trim() || "未命名",
    description: input.description.trim(),
    secret: generateSecret(),
    createdAt: new Date().toISOString(),
    status: "active",
  };
  saveLocalKeys([next, ...loadLocalKeys()]);
  return next;
}

export function updateLocalKey(id: string, patch: Partial<Pick<LocalKey, "tag" | "description" | "secret" | "status">>): LocalKey | undefined {
  const keys = loadLocalKeys();
  const index = keys.findIndex((row) => row.id === id);
  if (index < 0) {
    return undefined;
  }
  keys[index] = { ...keys[index], ...patch };
  saveLocalKeys(keys);
  return keys[index];
}

export function deleteLocalKey(id: string): void {
  saveLocalKeys(loadLocalKeys().filter((row) => row.id !== id));
}

export const systemDevKey: LocalKey = {
  id: "dev-key",
  tag: "系统",
  description: "控制台与本地调用使用的系统密钥。",
  secret: "dev-key",
  createdAt: "2026-09-01T00:00:00.000Z",
  status: "active",
};
