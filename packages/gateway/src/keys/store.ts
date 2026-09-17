import type { Env } from "../env.ts";
import { KvKeyStore } from "./kv.ts";
import { MemoryKeyStore } from "./memory.ts";
import type { KeyStore } from "./types.ts";

let isolate: MemoryKeyStore | undefined;

/** KV 绑上就走 KV；没绑则用 Worker 进程内存储，重启会丢。明文不落盘。 */
export function createKeyStore(env: Env): KeyStore {
  if (env.MYRIAD_KEYS) {
    return new KvKeyStore(env.MYRIAD_KEYS, env.KEY_PEPPER);
  }
  isolate ??= new MemoryKeyStore(env.KEY_PEPPER);
  return isolate;
}
