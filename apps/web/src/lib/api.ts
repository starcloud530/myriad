import type { CapabilityResponse, CatalogResponse } from "../features/capability/types.ts";
import type { ProductKey } from "../features/keys/types.ts";

async function request(path: string, key: string, init?: RequestInit): Promise<unknown> {
  const headers = new Headers(init?.headers);
  headers.set("authorization", `Bearer ${key}`);
  if (init?.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const response = await fetch(path, { ...init, headers });
  const body = (await response.json()) as unknown;
  if (!response.ok) {
    throw new Error(JSON.stringify(body, null, 2));
  }
  return body;
}

export async function listCapabilities(key: string): Promise<CatalogResponse> {
  return (await request("/v1/capabilities", key)) as CatalogResponse;
}

export async function getCapability(key: string, id: string): Promise<CapabilityResponse> {
  return (await request(`/v1/capabilities/${encodeURIComponent(id)}`, key)) as CapabilityResponse;
}

export async function invokeCapability(
  key: string,
  id: string,
  input: unknown,
): Promise<unknown> {
  return request(`/v1/capabilities/${id}`, key, {
    method: "POST",
    body: JSON.stringify({ input }),
  });
}

export async function listKeys(key: string): Promise<{ keys: ProductKey[] }> {
  return (await request("/v1/keys", key)) as { keys: ProductKey[] };
}

export async function createKey(
  key: string,
  input: { tag: string; description: string },
): Promise<{ key: ProductKey }> {
  return (await request("/v1/keys", key, {
    method: "POST",
    body: JSON.stringify(input),
  })) as { key: ProductKey };
}

export async function updateKey(
  key: string,
  id: string,
  input: { tag?: string; description?: string; status?: "active" | "disabled" },
): Promise<{ key: ProductKey }> {
  return (await request(`/v1/keys/${encodeURIComponent(id)}`, key, {
    method: "PATCH",
    body: JSON.stringify(input),
  })) as { key: ProductKey };
}

export async function rotateKey(key: string, id: string): Promise<{ key: ProductKey }> {
  return (await request(`/v1/keys/${encodeURIComponent(id)}/rotate`, key, {
    method: "POST",
  })) as { key: ProductKey };
}

export async function deleteKey(key: string, id: string): Promise<void> {
  await request(`/v1/keys/${encodeURIComponent(id)}`, key, { method: "DELETE" });
}
