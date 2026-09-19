import type { Env } from "../env.ts";
import { D1AuthStore } from "./d1.ts";
import { memoryAuthStore } from "./memory.ts";
import type { AuthStore } from "./types.ts";

let d1Store: D1AuthStore | undefined;

export function createAuthStore(env: Env): AuthStore {
  if (env.MYRIAD_LEDGER) {
    d1Store ??= new D1AuthStore(env.MYRIAD_LEDGER);
    return d1Store;
  }
  if (isProduction(env)) {
    throw new Error("MYRIAD_LEDGER is required in production");
  }
  return memoryAuthStore();
}

export function isProduction(env: Env): boolean {
  return env.MYRIAD_ENV === "produce" || env.MYRIAD_ENV === "production";
}

export function allowDevKey(env: Env): boolean {
  return !isProduction(env);
}
