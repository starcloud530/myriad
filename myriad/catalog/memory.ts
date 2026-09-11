import type { Capability, Product } from "../domain/types.ts";
import type { Catalog } from "./types.ts";
import type { CatalogSeed } from "./seed.ts";

function safeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.byteLength; i += 1) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

export class MemoryCatalog implements Catalog {
  private readonly capabilities: Map<string, Capability>;
  private readonly products: Product[];

  constructor(seed: CatalogSeed) {
    this.capabilities = new Map(seed.capabilities.map((item) => [item.id, item]));
    this.products = seed.products;
  }

  async listCapabilities(): Promise<Capability[]> {
    return [...this.capabilities.values()];
  }

  async getCapability(id: string): Promise<Capability | null> {
    return this.capabilities.get(id) ?? null;
  }

  async getProductByApiKey(apiKey: string): Promise<Product | null> {
    return this.products.find((product) => product.apiKeys.some((key) => safeEqual(key, apiKey))) ?? null;
  }
}
