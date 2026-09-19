const storageKey = "myriad.key.secrets.v1";
const activeKey = "myriad.activeKeyId";

function loadMap(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
  } catch {
    return {};
  }
}

export function rememberSecret(id: string, secret: string): void {
  const next = loadMap();
  next[id] = secret;
  sessionStorage.setItem(storageKey, JSON.stringify(next));
}

export function forgetSecret(id: string): void {
  const next = loadMap();
  delete next[id];
  sessionStorage.setItem(storageKey, JSON.stringify(next));
}

export function secretOf(id: string, fallback?: string): string | undefined {
  if (fallback) {
    return fallback;
  }
  return loadMap()[id];
}

export function readActiveKeyId(): string {
  return sessionStorage.getItem(activeKey) ?? "";
}

export function writeActiveKeyId(id: string): void {
  sessionStorage.setItem(activeKey, id);
}
