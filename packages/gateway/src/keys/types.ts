export type KeyStatus = "active" | "disabled";

export interface KeyRecord {
  id: string;
  productId: string;
  tag: string;
  description: string;
  secretHash: string;
  prefix: string;
  last4: string;
  status: KeyStatus;
  createdAt: string;
}

export interface PublicKey {
  id: string;
  product_id: string;
  tag: string;
  description: string;
  prefix: string;
  last4: string;
  status: KeyStatus;
  created_at: string;
  system: boolean;
}

export interface IssuedKey extends PublicKey {
  secret: string;
}

export interface KeyStore {
  list(productId: string): Promise<KeyRecord[]>;
  get(id: string): Promise<KeyRecord | null>;
  resolveSecret(secret: string): Promise<KeyRecord | null>;
  create(input: { productId: string; tag: string; description: string }): Promise<IssuedKey>;
  update(
    id: string,
    patch: Partial<Pick<KeyRecord, "tag" | "description" | "status">>,
  ): Promise<KeyRecord | null>;
  rotate(id: string): Promise<IssuedKey | null>;
  remove(id: string): Promise<boolean>;
}

export function toPublicKey(record: KeyRecord, system = false): PublicKey {
  return {
    id: record.id,
    product_id: record.productId,
    tag: record.tag,
    description: record.description,
    prefix: record.prefix,
    last4: record.last4,
    status: record.status,
    created_at: record.createdAt,
    system,
  };
}

export function systemKey(productId: string, secret: string): PublicKey {
  return {
    id: "dev-key",
    product_id: productId,
    tag: "系统",
    description: "种子密钥，写在 catalog，不是控制台签发。",
    prefix: secret,
    last4: secret.slice(-3),
    status: "active",
    created_at: "2026-09-01T00:00:00.000Z",
    system: true,
  };
}
