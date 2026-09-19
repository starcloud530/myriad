import { BadRequestError } from "../../domain/errors.ts";
import type { Env } from "../../env.ts";
import type { UpsertIdentity } from "../types.ts";

interface GoogleIdToken {
  iss?: string;
  aud?: string;
  exp?: number;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
  nonce?: string;
}

function decodePayload(idToken: string): GoogleIdToken {
  const parts = idToken.split(".");
  if (parts.length < 2 || !parts[1]) {
    throw new BadRequestError("invalid google id token");
  }
  const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(padded)) as GoogleIdToken;
}

export function googleRedirectUri(origin: string): string {
  return `${origin}/v1/auth/google/callback`;
}

export function googleAuthorizeUrl(env: Env, origin: string, state: string, nonce: string): string {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new BadRequestError("GOOGLE_CLIENT_ID is not set");
  }
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", googleRedirectUri(origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function googleIdentity(env: Env, origin: string, code: string, nonce: string): Promise<UpsertIdentity> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new BadRequestError("Google OAuth is not configured");
  }
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: googleRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  const tokenBody = (await tokenResponse.json()) as { id_token?: string; error?: string };
  if (!tokenResponse.ok || !tokenBody.id_token) {
    throw new BadRequestError(tokenBody.error ?? "google token exchange failed");
  }
  const infoResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenBody.id_token)}`,
  );
  const claims = infoResponse.ok ? ((await infoResponse.json()) as GoogleIdToken) : decodePayload(tokenBody.id_token);
  if (claims.aud !== env.GOOGLE_CLIENT_ID) {
    throw new BadRequestError("google audience mismatch");
  }
  if (claims.iss !== "https://accounts.google.com" && claims.iss !== "accounts.google.com") {
    throw new BadRequestError("google issuer mismatch");
  }
  if (!claims.sub) {
    throw new BadRequestError("google subject missing");
  }
  if (typeof claims.exp === "number" && claims.exp * 1000 < Date.now()) {
    throw new BadRequestError("google token expired");
  }
  if (claims.nonce && claims.nonce !== nonce) {
    throw new BadRequestError("google nonce mismatch");
  }
  const verified = claims.email_verified === true || claims.email_verified === "true";
  return {
    provider: "google",
    providerUid: claims.sub,
    email: verified ? (claims.email ?? null) : null,
    emailVerified: verified,
    displayName: claims.name || claims.email || "Google user",
    avatarUrl: claims.picture ?? null,
  };
}
