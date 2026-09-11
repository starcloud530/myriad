export interface LedgerEvent {
  requestId: string;
  productId: string;
  capabilityId: string;
  channelId: string;
  ok: boolean;
  durationMs: number;
  units: number;
  error?: string;
}

export interface Ledger {
  record(event: LedgerEvent): Promise<void>;
}

/** 成本账走追加日志：比 KV 写便宜，且「记了才算计过费」。 */
export class ConsoleLedger implements Ledger {
  async record(event: LedgerEvent): Promise<void> {
    console.log(JSON.stringify({ type: "myriad.ledger", ...event }));
  }
}
