const STORAGE_KEY = "myriad.play.conversations";

export type PlayRole = "user" | "assistant";

export interface PlayMessage {
  id: string;
  role: PlayRole;
  text: string;
  pickKeys?: string[];
}

export interface PlayConversation {
  id: string;
  title: string;
  updatedAt: number;
  messages: PlayMessage[];
}

export function createId(prefix = "msg"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function emptyConversation(title: string): PlayConversation {
  return {
    id: createId("chat"),
    title,
    updatedAt: Date.now(),
    messages: [],
  };
}

export function titleFromMessages(messages: PlayMessage[], fallback: string): string {
  const first = messages.find((message) => message.role === "user" && message.text.trim());
  if (!first) {
    return fallback;
  }
  const text = first.text.trim().replace(/\s+/g, " ");
  return text.length > 22 ? `${text.slice(0, 22)}…` : text;
}

export function loadConversations(): PlayConversation[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isConversation);
  } catch {
    return [];
  }
}

export function saveConversations(conversations: PlayConversation[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

function isConversation(value: unknown): value is PlayConversation {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as PlayConversation;
  return (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    typeof row.updatedAt === "number" &&
    Array.isArray(row.messages) &&
    row.messages.every(isMessage)
  );
}

function isMessage(value: unknown): value is PlayMessage {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as PlayMessage;
  const roleOk = row.role === "user" || row.role === "assistant";
  const picksOk = row.pickKeys == null || (Array.isArray(row.pickKeys) && row.pickKeys.every((key) => typeof key === "string"));
  return typeof row.id === "string" && roleOk && typeof row.text === "string" && picksOk;
}
