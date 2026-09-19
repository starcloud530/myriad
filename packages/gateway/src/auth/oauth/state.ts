import type { Env } from "../../env.ts";
import { allowDevKey } from "../store.ts";

export interface OauthState {
  state: string;
  nonce: string;
  provider: "google" | "github";
  next: string;
  exp: number;
}

function pepper(env: Env): string {
  if (env.KEY_PEPPER) {
    return env.KEY_PEPPER;
  }
  if (allowDevKey(env)) {
    return "dev-oauth-pepper";
  }
  throw new Error("KEY_PEPPER is required");
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function encode(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decode(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded);
}

export async function encodeOauthState(env: Env, payload: OauthState): Promise<string> {
  const body = encode(JSON.stringify(payload));
  const sig = await hmac(pepper(env), body);
  return `${body}.${sig}`;
}

export async function decodeOauthState(env: Env, raw: string | null): Promise<OauthState | null> {
  if (!raw || !raw.includes(".")) {
    return null;
  }
  const [body, sig] = raw.split(".");
  if (!body || !sig) {
    return null;
  }
  const expected = await hmac(pepper(env), body);
  if (expected.length !== sig.length) {
    return null;
  }
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  if (diff !== 0) {
    return null;
  }
  try {
    const parsed = JSON.parse(decode(body)) as OauthState;
    if (parsed.exp <= Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
