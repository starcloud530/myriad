import { BadRequestError } from "../../domain/errors.ts";
import type { Env } from "../../env.ts";
import type { UpsertIdentity } from "../types.ts";

export function githubRedirectUri(origin: string): string {
  return `${origin}/v1/auth/github/callback`;
}

export function githubAuthorizeUrl(env: Env, origin: string, state: string): string {
  if (!env.GITHUB_CLIENT_ID) {
    throw new BadRequestError("GITHUB_CLIENT_ID is not set");
  }
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  url.searchParams.set("redirect_uri", githubRedirectUri(origin));
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function githubIdentity(env: Env, origin: string, code: string): Promise<UpsertIdentity> {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    throw new BadRequestError("GitHub OAuth is not configured");
  }
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: githubRedirectUri(origin),
    }),
  });
  const tokenBody = (await tokenResponse.json()) as { access_token?: string; error?: string };
  if (!tokenResponse.ok || !tokenBody.access_token) {
    throw new BadRequestError(tokenBody.error ?? "github token exchange failed");
  }
  const headers = {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${tokenBody.access_token}`,
    "user-agent": "myriad",
  };
  const userResponse = await fetch("https://api.github.com/user", { headers });
  const user = (await userResponse.json()) as { id?: number; login?: string; name?: string; avatar_url?: string; email?: string };
  if (!userResponse.ok || user.id == null) {
    throw new BadRequestError("github user lookup failed");
  }
  const emailsResponse = await fetch("https://api.github.com/user/emails", { headers });
  const emails = emailsResponse.ok
    ? ((await emailsResponse.json()) as Array<{ email?: string; primary?: boolean; verified?: boolean }>)
    : [];
  const verified = emails.find((row) => row.verified && row.primary) ?? emails.find((row) => row.verified);
  const email = verified?.email ?? (user.email || null);
  return {
    provider: "github",
    providerUid: String(user.id),
    email,
    emailVerified: Boolean(verified?.verified),
    displayName: user.name || user.login || "GitHub user",
    avatarUrl: user.avatar_url ?? null,
  };
}
