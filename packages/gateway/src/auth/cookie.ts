import type { Env } from "../env.ts";

const MONTH = 30 * 24 * 60 * 60;

export function isSecureRequest(request: Request, env: Env): boolean {
  if (env.AUTH_PUBLIC_ORIGIN?.startsWith("https://")) {
    return true;
  }
  return new URL(request.url).protocol === "https:";
}

export function sidName(secure: boolean): string {
  return secure ? "__Host-sid" : "sid";
}

export function csrfName(secure: boolean): string {
  return secure ? "__Host-csrf" : "csrf";
}

function cookie(name: string, value: string, secure: boolean, httpOnly: boolean, maxAge = MONTH): string {
  const parts = [`${name}=${value}`, "Path=/", `Max-Age=${maxAge}`, "SameSite=Lax"];
  if (httpOnly) {
    parts.push("HttpOnly");
  }
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) {
    return null;
  }
  for (const part of header.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === name) {
      return rest.join("=");
    }
  }
  return null;
}

export function readSid(request: Request, env: Env): string | null {
  const secure = isSecureRequest(request, env);
  return readCookie(request, sidName(secure)) ?? readCookie(request, sidName(!secure));
}

export function readCsrf(request: Request, env: Env): string | null {
  const secure = isSecureRequest(request, env);
  return readCookie(request, csrfName(secure)) ?? readCookie(request, csrfName(!secure));
}

export function sessionCookies(request: Request, env: Env, sid: string, csrf: string): string[] {
  const secure = isSecureRequest(request, env);
  return [cookie(sidName(secure), sid, secure, true), cookie(csrfName(secure), csrf, secure, false)];
}

export function clearSessionCookies(request: Request, env: Env): string[] {
  const secure = isSecureRequest(request, env);
  return [cookie(sidName(secure), "", secure, true, 0), cookie(csrfName(secure), "", secure, false, 0)];
}

export function oauthCookie(request: Request, env: Env, value: string, maxAge = 600): string {
  const secure = isSecureRequest(request, env);
  return cookie(secure ? "__Host-oauth" : "oauth", value, secure, true, maxAge);
}

export function readOauthCookie(request: Request, env: Env): string | null {
  const secure = isSecureRequest(request, env);
  return readCookie(request, secure ? "__Host-oauth" : "oauth") ?? readCookie(request, secure ? "oauth" : "__Host-oauth");
}

export function clearOauthCookie(request: Request, env: Env): string {
  const secure = isSecureRequest(request, env);
  return cookie(secure ? "__Host-oauth" : "oauth", "", secure, true, 0);
}
