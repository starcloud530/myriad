import type { Env } from "../env.ts";
import { D1Ledger } from "./d1.ts";
import { MemoryLedger } from "./memory.ts";
import type { Ledger } from "./types.ts";

export type { Ledger, LedgerEvent, UsageRange, UsageReport } from "./types.ts";
export { aggregateUsage, parseRange, rangeWindow } from "./aggregate.ts";

let memory: MemoryLedger | undefined;

/** D1 有绑定就走可查询账本；本地单测 / 未绑定时用进程内内存，不造假数。 */
export function createLedger(env: Env): Ledger {
  if (env.MYRIAD_LEDGER) {
    return new D1Ledger(env.MYRIAD_LEDGER);
  }
  memory ??= new MemoryLedger();
  return memory;
}
