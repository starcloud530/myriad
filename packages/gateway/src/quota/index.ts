import type { Capability, Product } from "../domain/types.ts";

export interface QuotaGuard {
  assertWithin(product: Product, capability: Capability): Promise<void>;
}

/** 额度计数应进 Durable Object，不要写 KV。第一期先放行。 */
export class PassthroughQuota implements QuotaGuard {
  async assertWithin(_product: Product, _capability: Capability): Promise<void> {}
}
