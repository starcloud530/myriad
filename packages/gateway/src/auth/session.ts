import { CapabilityIds } from "../domain/ids.ts";
import type { Product } from "../domain/types.ts";
import type { Env } from "../env.ts";
import { randomToken, sha256Hex } from "./hash.ts";
import type { AuthStore, AuthUser, TenantRecord, UpsertIdentity } from "./types.ts";

const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

export function defaultCapabilities(): string[] {
  return Object.values(CapabilityIds);
}

export function productFromTenant(tenant: TenantRecord): Product {
  return {
    id: tenant.id,
    name: tenant.name,
    apiKeys: [],
    capabilities: tenant.capabilities,
  };
}

export async function issueSession(store: AuthStore, userId: string): Promise<{ sid: string; csrf: string }> {
  const sid = randomToken();
  const csrf = randomToken(16);
  await store.createSession({
    userId,
    tokenHash: await sha256Hex(sid),
    expiresAt: Date.now() + SESSION_MS,
  });
  return { sid, csrf };
}

export async function resolveSession(store: AuthStore, sid: string | null): Promise<AuthUser | null> {
  if (!sid) {
    return null;
  }
  const row = await store.getSessionByHash(await sha256Hex(sid));
  if (!row || row.revokedAt || row.expiresAt <= Date.now()) {
    return null;
  }
  const user = await store.getUser(row.userId);
  if (!user || user.status !== "active") {
    return null;
  }
  return user;
}

export async function loginIdentity(store: AuthStore, input: UpsertIdentity): Promise<{ user: AuthUser; tenant: TenantRecord }> {
  const existing = await store.findIdentity(input.provider, input.providerUid);
  let user: AuthUser;
  if (existing) {
    const current = await store.getUser(existing.userId);
    if (!current || current.status !== "active") {
      throw new Error("account disabled");
    }
    user = current;
  } else {
    user = await store.createUser(input);
  }
  await store.touchLogin(user.id);
  const tenant =
    (await store.getTenantByOwner(user.id)) ??
    (await store.createTenant({
      ownerUserId: user.id,
      name: user.displayName || "Workspace",
      capabilities: defaultCapabilities(),
    }));
  return { user, tenant };
}

export function publicOrigin(request: Request, env: Env): string {
  if (env.AUTH_PUBLIC_ORIGIN) {
    return env.AUTH_PUBLIC_ORIGIN.replace(/\/+$/, "");
  }
  const origin = request.headers.get("origin");
  if (origin) {
    return origin.replace(/\/+$/, "");
  }
  const referer = request.headers.get("referer");
  if (referer) {
    return new URL(referer).origin;
  }
  return new URL(request.url).origin;
}

export function safeNext(value: string | null, origin: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/home";
  }
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin) {
      return "/home";
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return "/home";
  }
}
