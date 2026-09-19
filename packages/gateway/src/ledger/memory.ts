import type { Ledger, LedgerEvent } from "./types.ts";

export class MemoryLedger implements Ledger {
  private readonly events: LedgerEvent[] = [];

  async record(event: LedgerEvent): Promise<void> {
    this.events.push(event);
  }

  async list(productId: string, from: number, to: number): Promise<LedgerEvent[]> {
    return this.events.filter(
      (event) => event.productId === productId && event.createdAt >= from && event.createdAt <= to,
    );
  }
}
