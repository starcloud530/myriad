import { describeSecret, generateSecret, hashSecret, newKeyId } from "./hash.ts";
import type { IssuedKey, KeyRecord, KeyStore } from "./types.ts";
import { toPublicKey } from "./types.ts";

export class MemoryKeyStore implements KeyStore {
  private readonly records = new Map<string, KeyRecord>();
  private readonly byHash = new Map<string, string>();

  constructor(private readonly pepper?: string) {}

  async list(productId: string): Promise<KeyRecord[]> {
    return [...this.records.values()]
      .filter((row) => row.productId === productId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async get(id: string): Promise<KeyRecord | null> {
    return this.records.get(id) ?? null;
  }

  async resolveSecret(secret: string): Promise<KeyRecord | null> {
    const digest = await hashSecret(secret, this.pepper);
    const id = this.byHash.get(digest);
    return id ? (this.records.get(id) ?? null) : null;
  }

  async create(input: { productId: string; tag: string; description: string }): Promise<IssuedKey> {
    const secret = generateSecret();
    const record = await this.recordFromSecret(input, secret);
    this.records.set(record.id, record);
    this.byHash.set(record.secretHash, record.id);
    return { ...toPublicKey(record), secret };
  }

  async update(
    id: string,
    patch: Partial<Pick<KeyRecord, "tag" | "description" | "status">>,
  ): Promise<KeyRecord | null> {
    const current = this.records.get(id);
    if (!current) {
      return null;
    }
    const next = { ...current, ...patch };
    this.records.set(id, next);
    return next;
  }

  async rotate(id: string): Promise<IssuedKey | null> {
    const current = this.records.get(id);
    if (!current) {
      return null;
    }
    this.byHash.delete(current.secretHash);
    const secret = generateSecret();
    const { prefix, last4 } = describeSecret(secret);
    const next: KeyRecord = {
      ...current,
      secretHash: await hashSecret(secret, this.pepper),
      prefix,
      last4,
    };
    this.records.set(id, next);
    this.byHash.set(next.secretHash, id);
    return { ...toPublicKey(next), secret };
  }

  async remove(id: string): Promise<boolean> {
    const current = this.records.get(id);
    if (!current) {
      return false;
    }
    this.byHash.delete(current.secretHash);
    this.records.delete(id);
    return true;
  }

  private async recordFromSecret(
    input: { productId: string; tag: string; description: string },
    secret: string,
  ): Promise<KeyRecord> {
    const { prefix, last4 } = describeSecret(secret);
    return {
      id: newKeyId(),
      productId: input.productId,
      tag: input.tag,
      description: input.description,
      secretHash: await hashSecret(secret, this.pepper),
      prefix,
      last4,
      status: "active",
      createdAt: new Date().toISOString(),
    };
  }
}
