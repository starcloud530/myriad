import type { Capability, Product } from "../domain/types.ts";

/** 读多写少的配置面。实现可以是内存，之后换成 KV。不要把计数写进来。 */
export interface Catalog {
  listCapabilities(): Promise<Capability[]>;
  getCapability(id: string): Promise<Capability | null>;
  getProduct(id: string): Promise<Product | null>;
  getProductByApiKey(apiKey: string): Promise<Product | null>;
}
