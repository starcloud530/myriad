import { AdapterRegistry } from "./adapters/registry.ts";
import { EchoAdapter } from "./adapters/echo.ts";
import { FalAdapter } from "./adapters/fal.ts";
import { HttpAdapter } from "./adapters/http.ts";
import { OpenAiCompatAdapter } from "./adapters/openai_compat.ts";
import { VolcengineAdapter } from "./adapters/volcengine.ts";
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
import {
  handleCreateKey,
  handleDeleteKey,
  handleListKeys,
  handleRotateKey,
  handleUpdateKey,
} from "./keys/http.ts";
import { createKeyStore, type KeyStore } from "./keys/index.ts";
import { ConsoleLedger } from "./ledger/index.ts";
import { PassthroughQuota } from "./quota/index.ts";

export interface AppDeps extends InvokeDeps {
  catalog: Catalog;
  keys: KeyStore;
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

/** 注册北向路由。下游合同以这里的路径为准，不在适配器里另开入口。 */
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

  router.on("GET", "/v1/keys", async (request) => {
    const product = await deps.auth.requireProduct(request);
    return handleListKeys(deps.keys, product);
  });

  router.on("POST", "/v1/keys", async (request) => {
    const product = await deps.auth.requireProduct(request);
    return handleCreateKey(deps.keys, product, await readJson(request));
  });

  router.on("PATCH", "/v1/keys/:id", async (request, params) => {
    const product = await deps.auth.requireProduct(request);
    return handleUpdateKey(deps.keys, product, params.id ?? "", await readJson(request));
  });

  router.on("POST", "/v1/keys/:id/rotate", async (request, params) => {
    const product = await deps.auth.requireProduct(request);
    return handleRotateKey(deps.keys, product, params.id ?? "");
  });

  router.on("DELETE", "/v1/keys/:id", async (request, params) => {
    const product = await deps.auth.requireProduct(request);
    return handleDeleteKey(deps.keys, product, params.id ?? "");
  });

  return router;
}

export function createDefaultDeps(env: Env): AppDeps {
  const catalog = new MemoryCatalog(defaultSeed());
  const keys = createKeyStore(env);
  const adapters = new AdapterRegistry()
    .register(new EchoAdapter())
    .register(new HttpAdapter())
    .register(new OpenAiCompatAdapter())
    .register(new FalAdapter())
    .register(new VolcengineAdapter());

  return {
    catalog,
    keys,
    auth: new ApiKeyAuth(catalog, keys),
    quota: new PassthroughQuota(),
    ledger: new ConsoleLedger(),
    adapters,
    env,
  };
}

export function createDefaultApp(env: Env): Router {
  return createApp(createDefaultDeps(env));
}
