import type { Catalog } from "../catalog/types.ts";
import { UnauthorizedError } from "../domain/errors.ts";
import type { Product } from "../domain/types.ts";

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
  constructor(private readonly catalog: Catalog) {}

  async requireProduct(request: Request): Promise<Product> {
    const apiKey = readBearer(request);
    if (!apiKey) {
      throw new UnauthorizedError();
    }
    const product = await this.catalog.getProductByApiKey(apiKey);
    if (!product) {
      throw new UnauthorizedError();
    }
    return product;
  }
}
