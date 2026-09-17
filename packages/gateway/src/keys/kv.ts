import { describeSecret, generateSecret, hashSecret, newKeyId } from "./hash.ts";
import type { IssuedKey, KeyRecord, KeyStore } from "./types.ts";
import { toPublicKey } from "./types.ts";

const recPrefix = "rec:";
const hashPrefix = "hash:";

export class KvKeyStore implements KeyStore {
  constructor(
    private readonly kv: KVNamespace,
    private readonly pepper?: string,
  ) {}

  async list(productId: string): Promise<KeyRecord[]> {
    const listed = await this.kv.list({ prefix: recPrefix });
    const rows = await Promise.all(
      listed.keys.map(async (item) => {
        const raw = await this.kv.get(item.name);
        return raw ? (JSON.parse(raw) as KeyRecord) : null;
      }),
    );
    return rows
      .filter((row): row is KeyRecord => row != null && row.productId === productId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async get(id: string): Promise<KeyRecord | null> {
    const raw = await this.kv.get(`${recPrefix}${id}`);
    return raw ? (JSON.parse(raw) as KeyRecord) : null;
  }

  async resolveSecret(secret: string): Promise<KeyRecord | null> {
    const digest = await hashSecret(secret, this.pepper);
    const id = await this.kv.get(`${hashPrefix}${digest}`);
    return id ? this.get(id) : null;
  }

  async create(input: { productId: string; tag: string; description: string }): Promise<IssuedKey> {
    const secret = generateSecret();
    const record = await this.recordFromSecret(input, secret);
    await this.write(record);
    return { ...toPublicKey(record), secret };
  }

  async update(
    id: string,
    patch: Partial<Pick<KeyRecord, "tag" | "description" | "status">>,
  ): Promise<KeyRecord | null> {
    const current = await this.get(id);
    if (!current) {
      return null;
    }
    const next = { ...current, ...patch };
    await this.kv.put(`${recPrefix}${id}`, JSON.stringify(next));
    return next;
  }

  async rotate(id: string): Promise<IssuedKey | null> {
    const current = await this.get(id);
    if (!current) {
      return null;
    }
    await this.kv.delete(`${hashPrefix}${current.secretHash}`);
    const secret = generateSecret();
    const { prefix, last4 } = describeSecret(secret);
    const next: KeyRecord = {
      ...current,
      secretHash: await hashSecret(secret, this.pepper),
      prefix,
      last4,
    };
    await this.write(next);
    return { ...toPublicKey(next), secret };
  }

  async remove(id: string): Promise<boolean> {
    const current = await this.get(id);
    if (!current) {
      return false;
    }
    await this.kv.delete(`${hashPrefix}${current.secretHash}`);
    await this.kv.delete(`${recPrefix}${id}`);
    return true;
  }

  private async write(record: KeyRecord): Promise<void> {
    await this.kv.put(`${recPrefix}${record.id}`, JSON.stringify(record));
    await this.kv.put(`${hashPrefix}${record.secretHash}`, record.id);
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
