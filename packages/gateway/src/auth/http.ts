import { BadRequestError, UnauthorizedError } from "../domain/errors.ts";
import type { Env } from "../env.ts";
import { json, redirect } from "../http/respond.ts";
import {
  clearOauthCookie,
  clearSessionCookies,
  oauthCookie,
  readOauthCookie,
  readSid,
  sessionCookies,
} from "./cookie.ts";
import { randomToken, sha256Hex } from "./hash.ts";
import { githubAuthorizeUrl, githubIdentity } from "./oauth/github.ts";
import { googleAuthorizeUrl, googleIdentity } from "./oauth/google.ts";
import { decodeOauthState, encodeOauthState } from "./oauth/state.ts";
import { issueSession, loginIdentity, publicOrigin, resolveSession, safeNext } from "./session.ts";
import { allowDevKey } from "./store.ts";
import type { AuthStore } from "./types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function handleAuthMe(store: AuthStore, request: Request, env: Env): Promise<Response> {
  const user = await resolveSession(store, readSid(request, env));
  if (!user) {
    throw new UnauthorizedError("not signed in");
  }
  const tenant = await store.getTenantByOwner(user.id);
  const providers = await store.listProviders(user.id);
  return json({
    user: {
      id: user.id,
      email: user.email,
      display_name: user.displayName,
      avatar_url: user.avatarUrl,
    },
    providers,
    tenant: tenant
      ? { id: tenant.id, name: tenant.name, capabilities: tenant.capabilities }
      : null,
  });
}

export async function handleAuthLogout(store: AuthStore, request: Request, env: Env): Promise<Response> {
  const sid = readSid(request, env);
  if (sid) {
    await store.revokeSession(await sha256Hex(sid));
  }
  const response = json({ ok: true });
  const headers = new Headers(response.headers);
  for (const item of [...clearSessionCookies(request, env), clearOauthCookie(request, env)]) {
    headers.append("Set-Cookie", item);
  }
  return new Response(response.body, { status: response.status, headers });
}

export async function handleAuthDev(store: AuthStore, request: Request, env: Env, body: unknown): Promise<Response> {
  if (!allowDevKey(env)) {
    throw new UnauthorizedError("dev session is disabled");
  }
  const email = isRecord(body) && typeof body.email === "string" ? body.email.trim().toLowerCase() : "dev@localhost";
  const { user } = await loginIdentity(store, {
    provider: "dev",
    providerUid: email || "dev@localhost",
    email: email || "dev@localhost",
    emailVerified: true,
    displayName: "Local dev",
  });
  const session = await issueSession(store, user.id);
  const tenant = await store.getTenantByOwner(user.id);
  const response = json({
    ok: true,
    user: { id: user.id, email: user.email, display_name: user.displayName },
    tenant: tenant ? { id: tenant.id, name: tenant.name } : null,
  });
  const headers = new Headers(response.headers);
  for (const item of sessionCookies(request, env, session.sid, session.csrf)) {
    headers.append("Set-Cookie", item);
  }
  return new Response(response.body, { status: 200, headers });
}

export async function handleOauthStart(
  request: Request,
  env: Env,
  provider: "google" | "github",
): Promise<Response> {
  const origin = publicOrigin(request, env);
  const next = safeNext(new URL(request.url).searchParams.get("next"), origin);
  const state = randomToken(16);
  const nonce = randomToken(16);
  const packed = await encodeOauthState(env, {
    state,
    nonce,
    provider,
    next,
    exp: Date.now() + 10 * 60 * 1000,
  });
  const location =
    provider === "google" ? googleAuthorizeUrl(env, origin, state, nonce) : githubAuthorizeUrl(env, origin, state);
  return redirect(location, [oauthCookie(request, env, packed)]);
}

export async function handleOauthCallback(
  store: AuthStore,
  request: Request,
  env: Env,
  provider: "google" | "github",
): Promise<Response> {
  const origin = publicOrigin(request, env);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const packed = await decodeOauthState(env, readOauthCookie(request, env));
  if (!code || !state || !packed || packed.state !== state || packed.provider !== provider) {
    throw new BadRequestError("oauth state mismatch");
  }
  const identity =
    provider === "google"
      ? await googleIdentity(env, origin, code, packed.nonce)
      : await githubIdentity(env, origin, code);
  const { user } = await loginIdentity(store, identity);
  const session = await issueSession(store, user.id);
  return redirect(`${origin}${packed.next}`, [
    ...sessionCookies(request, env, session.sid, session.csrf),
    clearOauthCookie(request, env),
  ]);
}
