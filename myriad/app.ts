import { AdapterRegistry } from "./adapters/registry.ts";
import { EchoAdapter } from "./adapters/echo.ts";
import { HttpAdapter } from "./adapters/http.ts";
import { ApiKeyAuth } from "./auth/index.ts";
import { MemoryCatalog } from "./catalog/memory.ts";
import { defaultSeed } from "./catalog/seed.ts";
import type { Catalog } from "./catalog/types.ts";
import { BadRequestError, NotFoundError } from "./domain/errors.ts";
import { toPublicCapability } from "./domain/types.ts";
import type { Env } from "./env.ts";
import { json } from "./http/respond.ts";
import { Router } from "./http/router.ts";
import { invokeCapability, parseInvokeBody, type InvokeDeps } from "./invoke/index.ts";
import { ConsoleLedger } from "./ledger/index.ts";
import { PassthroughQuota } from "./quota/index.ts";

export interface AppDeps extends InvokeDeps {
  catalog: Catalog;
}

async function readJson(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new BadRequestError("invalid json");
  }
}

export function createApp(deps: AppDeps): Router {
  const router = new Router();

  router.on("GET", "/health", async () =>
    json({
      ok: true,
      name: "myriad",
      name_zh: "万象",
    }),
  );

  router.on("GET", "/v1/capabilities", async (request) => {
    const product = await deps.auth.requireProduct(request);
    const capabilities = await deps.catalog.listCapabilities();
    return json({
      capabilities: capabilities
        .filter((item) => product.capabilities.includes(item.id))
        .map(toPublicCapability),
    });
  });

  router.on("GET", "/v1/capabilities/:id", async (request, params) => {
    const product = await deps.auth.requireProduct(request);
    const capability = await deps.catalog.getCapability(params.id ?? "");
    if (!capability || !product.capabilities.includes(capability.id)) {
      throw new NotFoundError(`capability ${params.id} not found`);
    }
    return json({ capability: toPublicCapability(capability) });
  });

  router.on("POST", "/v1/capabilities/:id", async (request, params) => {
    const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
    const parsed = parseInvokeBody(await readJson(request));
    const result = await invokeCapability(deps, {
      request,
      requestId,
      capabilityId: params.id ?? "",
      input: parsed.input,
      channel: parsed.channel,
    });
    return json(result, 200, requestId);
  });

  return router;
}

export function createDefaultDeps(_env: Env): AppDeps {
  const catalog = new MemoryCatalog(defaultSeed());
  const adapters = new AdapterRegistry().register(new EchoAdapter()).register(new HttpAdapter());

  return {
    catalog,
    auth: new ApiKeyAuth(catalog),
    quota: new PassthroughQuota(),
    ledger: new ConsoleLedger(),
    adapters,
  };
}

export function createDefaultApp(env: Env): Router {
  return createApp(createDefaultDeps(env));
}
