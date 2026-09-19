CREATE TABLE IF NOT EXISTS ledger_events (
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
);

CREATE INDEX IF NOT EXISTS ledger_product_time ON ledger_events (product_id, created_at);
