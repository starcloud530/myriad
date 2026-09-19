import type { AuthProvider, AuthStore, AuthUser, SessionRecord, TenantRecord, UpsertIdentity } from "./types.ts";

const schema = [
  `CREATE TABLE IF NOT EXISTS auth_users (
    id TEXT PRIMARY KEY,
    email TEXT,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at INTEGER NOT NULL,
    last_login_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS auth_identities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_uid TEXT NOT NULL,
    email TEXT,
    email_verified INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    UNIQUE (provider, provider_uid)
  )`,
  `CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    revoked_at INTEGER
  )`,
  `CREATE INDEX IF NOT EXISTS auth_sessions_user ON auth_sessions (user_id)`,
  `CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_user_id TEXT NOT NULL UNIQUE,
    capabilities TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`,
];

function asUser(row: { id: string; email: string | null; display_name: string; avatar_url: string | null; status: string }): AuthUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    status: row.status === "disabled" ? "disabled" : "active",
  };
}

function asTenant(row: { id: string; name: string; owner_user_id: string; capabilities: string }): TenantRecord {
  let capabilities: string[] = [];
  try {
    const parsed = JSON.parse(row.capabilities) as unknown;
    if (Array.isArray(parsed)) {
      capabilities = parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    capabilities = [];
  }
  return {
    id: row.id,
    name: row.name,
    ownerUserId: row.owner_user_id,
    capabilities,
  };
}

export class D1AuthStore implements AuthStore {
  private ready: Promise<void> | undefined;

  constructor(private readonly db: D1Database) {}

  private ensure(): Promise<void> {
    this.ready ??= (async () => {
      for (const statement of schema) {
        await this.db.prepare(statement).run();
      }
    })();
    return this.ready;
  }

  async findIdentity(provider: AuthProvider, providerUid: string): Promise<{ userId: string } | null> {
    await this.ensure();
    const row = await this.db
      .prepare("SELECT user_id FROM auth_identities WHERE provider = ? AND provider_uid = ? LIMIT 1")
      .bind(provider, providerUid)
      .first<{ user_id: string }>();
    return row ? { userId: row.user_id } : null;
  }

  async getUser(id: string): Promise<AuthUser | null> {
    await this.ensure();
    const row = await this.db
      .prepare("SELECT id, email, display_name, avatar_url, status FROM auth_users WHERE id = ? LIMIT 1")
      .bind(id)
      .first<{ id: string; email: string | null; display_name: string; avatar_url: string | null; status: string }>();
    return row ? asUser(row) : null;
  }

  async createUser(input: UpsertIdentity): Promise<AuthUser> {
    await this.ensure();
    const userId = crypto.randomUUID();
    const now = Date.now();
    const email = input.emailVerified && input.email ? input.email : null;
    await this.db
      .prepare("INSERT INTO auth_users (id, email, display_name, avatar_url, status, created_at) VALUES (?, ?, ?, ?, 'active', ?)")
      .bind(userId, email, input.displayName, input.avatarUrl ?? null, now)
      .run();
    await this.db
      .prepare(
        "INSERT INTO auth_identities (id, user_id, provider, provider_uid, email, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(crypto.randomUUID(), userId, input.provider, input.providerUid, input.email ?? null, input.emailVerified ? 1 : 0, now)
      .run();
    return {
      id: userId,
      email,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl ?? null,
      status: "active",
    };
  }

  async touchLogin(userId: string): Promise<void> {
    await this.ensure();
    await this.db.prepare("UPDATE auth_users SET last_login_at = ? WHERE id = ?").bind(Date.now(), userId).run();
  }

  async getTenantByOwner(userId: string): Promise<TenantRecord | null> {
    await this.ensure();
    const row = await this.db
      .prepare("SELECT id, name, owner_user_id, capabilities FROM tenants WHERE owner_user_id = ? LIMIT 1")
      .bind(userId)
      .first<{ id: string; name: string; owner_user_id: string; capabilities: string }>();
    return row ? asTenant(row) : null;
  }

  async getTenant(id: string): Promise<TenantRecord | null> {
    await this.ensure();
    const row = await this.db
      .prepare("SELECT id, name, owner_user_id, capabilities FROM tenants WHERE id = ? LIMIT 1")
      .bind(id)
      .first<{ id: string; name: string; owner_user_id: string; capabilities: string }>();
    return row ? asTenant(row) : null;
  }

  async createTenant(input: { ownerUserId: string; name: string; capabilities: string[] }): Promise<TenantRecord> {
    await this.ensure();
    const id = crypto.randomUUID();
    await this.db
      .prepare("INSERT INTO tenants (id, name, owner_user_id, capabilities, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(id, input.name, input.ownerUserId, JSON.stringify(input.capabilities), Date.now())
      .run();
    return { id, name: input.name, ownerUserId: input.ownerUserId, capabilities: input.capabilities };
  }

  async createSession(input: { userId: string; tokenHash: string; expiresAt: number }): Promise<void> {
    await this.ensure();
    await this.db
      .prepare("INSERT INTO auth_sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)")
      .bind(crypto.randomUUID(), input.userId, input.tokenHash, input.expiresAt)
      .run();
  }

  async getSessionByHash(tokenHash: string): Promise<SessionRecord | null> {
    await this.ensure();
    const row = await this.db
      .prepare("SELECT id, user_id, token_hash, expires_at, revoked_at FROM auth_sessions WHERE token_hash = ? LIMIT 1")
      .bind(tokenHash)
      .first<{ id: string; user_id: string; token_hash: string; expires_at: number; revoked_at: number | null }>();
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at,
    };
  }

  async revokeSession(tokenHash: string): Promise<void> {
    await this.ensure();
    await this.db
      .prepare("UPDATE auth_sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL")
      .bind(Date.now(), tokenHash)
      .run();
  }

  async listProviders(userId: string): Promise<AuthProvider[]> {
    await this.ensure();
    const rows = await this.db
      .prepare("SELECT provider FROM auth_identities WHERE user_id = ?")
      .bind(userId)
      .all<{ provider: string }>();
    return (rows.results ?? [])
      .map((row) => row.provider)
      .filter((item): item is AuthProvider => item === "google" || item === "github" || item === "dev");
  }
}
