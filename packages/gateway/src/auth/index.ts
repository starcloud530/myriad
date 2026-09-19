import type { Catalog } from "../catalog/types.ts";
import { ForbiddenError, UnauthorizedError } from "../domain/errors.ts";
import type { Product } from "../domain/types.ts";
import type { Env } from "../env.ts";
import type { KeyStore } from "../keys/types.ts";
import { readCsrf, readSid } from "./cookie.ts";
import { productFromTenant, resolveSession } from "./session.ts";
import { allowDevKey } from "./store.ts";
import type { AuthStore } from "./types.ts";

export type { AuthStore } from "./types.ts";
export { createAuthStore } from "./store.ts";

export interface AuthContext {
  product: Product;
  keyId: string;
  userId?: string;
}

export interface Authenticator {
  requireProduct(request: Request): Promise<Product>;
  requireAuth(request: Request): Promise<AuthContext>;
}

function readBearer(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || null;
}

export class GatewayAuth implements Authenticator {
  constructor(
    private readonly catalog: Catalog,
    private readonly keys: KeyStore | undefined,
    private readonly store: AuthStore,
    private readonly env: Env,
  ) {}

  async requireAuth(request: Request): Promise<AuthContext> {
    const user = await resolveSession(this.store, readSid(request, this.env));
    if (user) {
      assertCsrf(request, this.env);
      const tenant = await this.store.getTenantByOwner(user.id);
      if (!tenant) {
        throw new UnauthorizedError("workspace missing");
      }
      const apiKey = readBearer(request);
      if (apiKey && this.keys) {
        const issued = await this.keys.resolveSecret(apiKey);
        if (issued && issued.status === "active" && issued.productId === tenant.id) {
          return { product: productFromTenant(tenant), keyId: issued.id, userId: user.id };
        }
      }
      return { product: productFromTenant(tenant), keyId: "session", userId: user.id };
    }

    const apiKey = readBearer(request);
    if (!apiKey) {
      throw new UnauthorizedError();
    }
    if (allowDevKey(this.env)) {
      const seeded = await this.catalog.getProductByApiKey(apiKey);
      if (seeded) {
        return { product: seeded, keyId: "system" };
      }
    }
    const issued = this.keys ? await this.keys.resolveSecret(apiKey) : null;
    if (!issued || issued.status !== "active") {
      throw new UnauthorizedError();
    }
    const tenant = await this.store.getTenant(issued.productId);
    if (tenant) {
      return { product: productFromTenant(tenant), keyId: issued.id };
    }
    const product = await this.catalog.getProduct(issued.productId);
    if (!product) {
      throw new UnauthorizedError();
    }
    return { product, keyId: issued.id };
  }

  async requireProduct(request: Request): Promise<Product> {
    return (await this.requireAuth(request)).product;
  }
}

function assertCsrf(request: Request, env: Env): void {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return;
  }
  const cookie = readCsrf(request, env);
  const header = request.headers.get("x-csrf-token");
  if (!cookie || !header || cookie !== header) {
    throw new ForbiddenError("csrf token mismatch");
  }
}
