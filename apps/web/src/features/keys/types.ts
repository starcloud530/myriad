export interface ProductKey {
  id: string;
  product_id: string;
  tag: string;
  description: string;
  prefix: string;
  last4: string;
  status: "active" | "disabled";
  created_at: string;
  system: boolean;
  secret?: string;
}

export function displayKey(key: ProductKey): string {
  if (key.system) {
    return key.prefix;
  }
  return `${key.prefix}••••${key.last4}`;
}
