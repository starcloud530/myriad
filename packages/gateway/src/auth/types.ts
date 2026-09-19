export type AuthProvider = "google" | "github" | "dev";

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  status: "active" | "disabled";
}

export interface TenantRecord {
  id: string;
  name: string;
  ownerUserId: string;
  capabilities: string[];
}

export interface SessionRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: number;
  revokedAt: number | null;
}

export interface UpsertIdentity {
  provider: AuthProvider;
  providerUid: string;
  email?: string | null;
  emailVerified: boolean;
  displayName: string;
  avatarUrl?: string | null;
}

export interface AuthStore {
  findIdentity(provider: AuthProvider, providerUid: string): Promise<{ userId: string } | null>;
  getUser(id: string): Promise<AuthUser | null>;
  createUser(input: UpsertIdentity): Promise<AuthUser>;
  touchLogin(userId: string): Promise<void>;
  getTenantByOwner(userId: string): Promise<TenantRecord | null>;
  getTenant(id: string): Promise<TenantRecord | null>;
  createTenant(input: { ownerUserId: string; name: string; capabilities: string[] }): Promise<TenantRecord>;
  createSession(input: { userId: string; tokenHash: string; expiresAt: number }): Promise<void>;
  getSessionByHash(tokenHash: string): Promise<SessionRecord | null>;
  revokeSession(tokenHash: string): Promise<void>;
  listProviders(userId: string): Promise<AuthProvider[]>;
}
