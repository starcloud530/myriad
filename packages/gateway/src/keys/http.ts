import { BadRequestError, ForbiddenError, NotFoundError } from "../domain/errors.ts";
import type { Product } from "../domain/types.ts";
import { json } from "../http/respond.ts";
import type { KeyStore } from "./types.ts";
import { systemKey, toPublicKey } from "./types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

export function listPublicKeys(product: Product, records: Awaited<ReturnType<KeyStore["list"]>>) {
  const system = product.apiKeys[0]
    ? [systemKey(product.id, product.apiKeys[0])]
    : [];
  return [...system, ...records.map((row) => toPublicKey(row))];
}

export async function handleListKeys(keys: KeyStore, product: Product): Promise<Response> {
  return json({ keys: listPublicKeys(product, await keys.list(product.id)) });
}

export async function handleCreateKey(
  keys: KeyStore,
  product: Product,
  body: unknown,
): Promise<Response> {
  if (!isRecord(body)) {
    throw new BadRequestError("body must be an object");
  }
  const tag = readText(body.tag);
  if (!tag) {
    throw new BadRequestError("tag is required");
  }
  const issued = await keys.create({
    productId: product.id,
    tag,
    description: readText(body.description),
  });
  return json({ key: issued }, 201);
}

export async function handleUpdateKey(
  keys: KeyStore,
  product: Product,
  id: string,
  body: unknown,
): Promise<Response> {
  assertMutable(id);
  if (!isRecord(body)) {
    throw new BadRequestError("body must be an object");
  }
  const current = await keys.get(id);
  if (!current || current.productId !== product.id) {
    throw new NotFoundError(`key ${id} not found`);
  }
  const patch: { tag?: string; description?: string; status?: "active" | "disabled" } = {};
  if ("tag" in body) {
    const tag = readText(body.tag);
    if (!tag) {
      throw new BadRequestError("tag is required");
    }
    patch.tag = tag;
  }
  if ("description" in body) {
    patch.description = readText(body.description);
  }
  if (body.status === "active" || body.status === "disabled") {
    patch.status = body.status;
  }
  const next = await keys.update(id, patch);
  if (!next) {
    throw new NotFoundError(`key ${id} not found`);
  }
  return json({ key: toPublicKey(next) });
}

export async function handleRotateKey(keys: KeyStore, product: Product, id: string): Promise<Response> {
  assertMutable(id);
  const current = await keys.get(id);
  if (!current || current.productId !== product.id) {
    throw new NotFoundError(`key ${id} not found`);
  }
  const issued = await keys.rotate(id);
  if (!issued) {
    throw new NotFoundError(`key ${id} not found`);
  }
  return json({ key: issued });
}

export async function handleDeleteKey(keys: KeyStore, product: Product, id: string): Promise<Response> {
  assertMutable(id);
  const current = await keys.get(id);
  if (!current || current.productId !== product.id) {
    throw new NotFoundError(`key ${id} not found`);
  }
  await keys.remove(id);
  return json({ ok: true });
}

function assertMutable(id: string): void {
  if (id === "dev-key") {
    throw new ForbiddenError("system key cannot be changed");
  }
}
