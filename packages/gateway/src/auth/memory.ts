import type { AuthProvider, AuthStore, AuthUser, SessionRecord, TenantRecord, UpsertIdentity } from "./types.ts";

const users = new Map<string, AuthUser>();
const identities = new Map<string, { userId: string }>();
const tenantsByOwner = new Map<string, TenantRecord>();
const tenants = new Map<string, TenantRecord>();
const sessions = new Map<string, SessionRecord>();

function identityKey(provider: AuthProvider, providerUid: string): string {
  return `${provider}:${providerUid}`;
}

export class MemoryAuthStore implements AuthStore {
  async findIdentity(provider: AuthProvider, providerUid: string): Promise<{ userId: string } | null> {
    return identities.get(identityKey(provider, providerUid)) ?? null;
  }

  async getUser(id: string): Promise<AuthUser | null> {
    return users.get(id) ?? null;
  }

  async createUser(input: UpsertIdentity): Promise<AuthUser> {
    const user: AuthUser = {
      id: crypto.randomUUID(),
      email: input.emailVerified ? (input.email ?? null) : null,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl ?? null,
      status: "active",
    };
    users.set(user.id, user);
    identities.set(identityKey(input.provider, input.providerUid), { userId: user.id });
    return user;
  }

  async touchLogin(userId: string): Promise<void> {
    void userId;
  }

  async getTenantByOwner(userId: string): Promise<TenantRecord | null> {
    return tenantsByOwner.get(userId) ?? null;
  }

  async getTenant(id: string): Promise<TenantRecord | null> {
    return tenants.get(id) ?? null;
  }

  async createTenant(input: { ownerUserId: string; name: string; capabilities: string[] }): Promise<TenantRecord> {
    const row: TenantRecord = {
      id: crypto.randomUUID(),
      name: input.name,
      ownerUserId: input.ownerUserId,
      capabilities: input.capabilities,
    };
    tenants.set(row.id, row);
    tenantsByOwner.set(row.ownerUserId, row);
    return row;
  }

  async createSession(input: { userId: string; tokenHash: string; expiresAt: number }): Promise<void> {
    sessions.set(input.tokenHash, {
      id: crypto.randomUUID(),
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      revokedAt: null,
    });
  }

  async getSessionByHash(tokenHash: string): Promise<SessionRecord | null> {
    return sessions.get(tokenHash) ?? null;
  }

  async revokeSession(tokenHash: string): Promise<void> {
    const current = sessions.get(tokenHash);
    if (current) {
      current.revokedAt = Date.now();
    }
  }

  async listProviders(userId: string): Promise<AuthProvider[]> {
    const found: AuthProvider[] = [];
    for (const [key, row] of identities) {
      if (row.userId !== userId) {
        continue;
      }
      const provider = key.split(":")[0];
      if (provider === "google" || provider === "github" || provider === "dev") {
        found.push(provider);
      }
    }
    return found;
  }
}

let singleton: MemoryAuthStore | undefined;

export function memoryAuthStore(): MemoryAuthStore {
  singleton ??= new MemoryAuthStore();
  return singleton;
}
