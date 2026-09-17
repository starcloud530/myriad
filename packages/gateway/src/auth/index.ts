import type { Catalog } from "../catalog/types.ts";
import { UnauthorizedError } from "../domain/errors.ts";
import type { Product } from "../domain/types.ts";
import type { KeyStore } from "../keys/types.ts";

export interface Authenticator {
  requireProduct(request: Request): Promise<Product>;
}

function readBearer(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || null;
}

export class ApiKeyAuth implements Authenticator {
  constructor(
    private readonly catalog: Catalog,
    private readonly keys?: KeyStore,
  ) {}

  async requireProduct(request: Request): Promise<Product> {
    const apiKey = readBearer(request);
    if (!apiKey) {
      throw new UnauthorizedError();
    }
    const seeded = await this.catalog.getProductByApiKey(apiKey);
    if (seeded) {
      return seeded;
    }
    const issued = this.keys ? await this.keys.resolveSecret(apiKey) : null;
    if (!issued || issued.status !== "active") {
      throw new UnauthorizedError();
    }
    const product = await this.catalog.getProduct(issued.productId);
    if (!product) {
      throw new UnauthorizedError();
    }
    return product;
  }
}
