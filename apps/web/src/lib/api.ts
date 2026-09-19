import type { CapabilityResponse, CatalogResponse } from "../features/capability/types.ts";
import type { ProductKey } from "../features/keys/types.ts";
import type { HealthReport, UsageRange, UsageReport } from "../features/usage/types.ts";

function csrfToken(): string {
  const match = document.cookie.match(/(?:^|; )(?:__Host-csrf|csrf)=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : "";
}

async function request(path: string, init?: RequestInit, key?: string): Promise<unknown> {
  const headers = new Headers(init?.headers);
  if (key) {
    headers.set("authorization", `Bearer ${key}`);
  }
  if (init?.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const method = (init?.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const csrf = csrfToken();
    if (csrf) {
      headers.set("x-csrf-token", csrf);
    }
  }
  const response = await fetch(path, { ...init, headers, credentials: "include" });
  const body = (await response.json()) as unknown;
  if (!response.ok) {
    throw new Error(JSON.stringify(body, null, 2));
  }
  return body;
}

export type AuthMe = {
  user: { id: string; email: string | null; display_name: string; avatar_url: string | null };
  providers?: Array<"google" | "github" | "dev">;
  tenant: { id: string; name: string; capabilities: string[] } | null;
};

export async function getAuthMe(): Promise<AuthMe> {
  return (await request("/v1/auth/me")) as AuthMe;
}

export async function logoutSession(): Promise<void> {
  await request("/v1/auth/logout", { method: "POST" });
}

export async function createDevSession(email?: string): Promise<AuthMe> {
  return (await request("/v1/auth/dev/session", {
    method: "POST",
    body: JSON.stringify({ email: email ?? "dev@localhost" }),
  })) as AuthMe;
}

export async function listCapabilities(key?: string): Promise<CatalogResponse> {
  return (await request("/v1/capabilities", undefined, key)) as CatalogResponse;
}

export async function getCapability(key: string | undefined, id: string): Promise<CapabilityResponse> {
  return (await request(`/v1/capabilities/${encodeURIComponent(id)}`, undefined, key)) as CapabilityResponse;
}

export async function invokeCapability(key: string, id: string, input: unknown): Promise<unknown> {
  return request(
    `/v1/capabilities/${id}`,
    {
      method: "POST",
      body: JSON.stringify({ input }),
    },
    key,
  );
}

export async function listKeys(key?: string): Promise<{ keys: ProductKey[] }> {
  return (await request("/v1/keys", undefined, key)) as { keys: ProductKey[] };
}

export async function createKey(
  input: { tag: string; description: string },
  key?: string,
): Promise<{ key: ProductKey }> {
  return (await request(
    "/v1/keys",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    key,
  )) as { key: ProductKey };
}

export async function updateKey(
  id: string,
  input: { tag?: string; description?: string; status?: "active" | "disabled" },
  key?: string,
): Promise<{ key: ProductKey }> {
  return (await request(
    `/v1/keys/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
    key,
  )) as { key: ProductKey };
}

export async function rotateKey(id: string, key?: string): Promise<{ key: ProductKey }> {
  return (await request(`/v1/keys/${encodeURIComponent(id)}/rotate`, { method: "POST" }, key)) as { key: ProductKey };
}

export async function deleteKey(id: string, key?: string): Promise<void> {
  await request(`/v1/keys/${encodeURIComponent(id)}`, { method: "DELETE" }, key);
}

export async function getUsage(range: UsageRange, key?: string): Promise<UsageReport> {
  return (await request(`/v1/usage?range=${range}`, undefined, key)) as UsageReport;
}

export async function getHealth(): Promise<HealthReport> {
  const response = await fetch("/health");
  const body = (await response.json()) as unknown;
  if (!response.ok) {
    throw new Error(JSON.stringify(body, null, 2));
  }
  return body as HealthReport;
}
