import type { Ledger, LedgerEvent } from "./types.ts";

const createTable = `CREATE TABLE IF NOT EXISTS ledger_events (
  request_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  key_id TEXT NOT NULL,
  capability_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  ok INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  units INTEGER NOT NULL,
  error TEXT,
  created_at INTEGER NOT NULL
)`;

const createIndex =
  "CREATE INDEX IF NOT EXISTS ledger_product_time ON ledger_events (product_id, created_at)";

export class D1Ledger implements Ledger {
  private ready: Promise<void> | undefined;

  constructor(private readonly db: D1Database) {}

  private ensure(): Promise<void> {
    this.ready ??= this.db
      .prepare(createTable)
      .run()
      .then(() => this.db.prepare(createIndex).run())
      .then(() => undefined);
    return this.ready;
  }

  async record(event: LedgerEvent): Promise<void> {
    await this.ensure();
    await this.db
      .prepare(
        `INSERT INTO ledger_events
          (request_id, product_id, key_id, capability_id, channel_id, ok, duration_ms, units, error, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        event.requestId,
        event.productId,
        event.keyId,
        event.capabilityId,
        event.channelId,
        event.ok ? 1 : 0,
        event.durationMs,
        event.units,
        event.error ?? null,
        event.createdAt,
      )
      .run();
  }

  async list(productId: string, from: number, to: number): Promise<LedgerEvent[]> {
    await this.ensure();
    const rows = await this.db
      .prepare(
        `SELECT request_id, product_id, key_id, capability_id, channel_id, ok, duration_ms, units, error, created_at
         FROM ledger_events
         WHERE product_id = ? AND created_at >= ? AND created_at <= ?
         ORDER BY created_at ASC`,
      )
      .bind(productId, from, to)
      .all<{
        request_id: string;
        product_id: string;
        key_id: string;
        capability_id: string;
        channel_id: string;
        ok: number;
        duration_ms: number;
        units: number;
        error: string | null;
        created_at: number;
      }>();
    return (rows.results ?? []).map((row) => ({
      requestId: row.request_id,
      productId: row.product_id,
      keyId: row.key_id,
      capabilityId: row.capability_id,
      channelId: row.channel_id,
      ok: row.ok === 1,
      durationMs: row.duration_ms,
      units: row.units,
      error: row.error ?? undefined,
      createdAt: row.created_at,
    }));
  }
}
