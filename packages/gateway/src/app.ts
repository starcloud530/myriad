import { AdapterRegistry } from "./adapters/registry.ts";
import { EchoAdapter } from "./adapters/echo.ts";
import { FalAdapter } from "./adapters/fal.ts";
import { HttpAdapter } from "./adapters/http.ts";
import { OpenAiCompatAdapter } from "./adapters/openai_compat.ts";
import { VolcengineAdapter } from "./adapters/volcengine.ts";
import {
  createAuthStore,
  GatewayAuth,
} from "./auth/index.ts";
import { isProduction } from "./auth/store.ts";
import {
  handleAuthDev,
  handleAuthLogout,
  handleAuthMe,
  handleOauthCallback,
  handleOauthStart,
} from "./auth/http.ts";
import type { AuthStore } from "./auth/types.ts";
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
import { aggregateUsage, createLedger, parseRange, rangeWindow } from "./ledger/index.ts";
import { PassthroughQuota } from "./quota/index.ts";

export interface AppDeps extends InvokeDeps {
  catalog: Catalog;
  keys: KeyStore;
  authStore: AuthStore;
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

  router.on("GET", "/v1/auth/me", async (request) => handleAuthMe(deps.authStore, request, deps.env));
  router.on("POST", "/v1/auth/logout", async (request) => handleAuthLogout(deps.authStore, request, deps.env));
  router.on("POST", "/v1/auth/dev/session", async (request) =>
    handleAuthDev(deps.authStore, request, deps.env, await readJson(request)),
  );
  router.on("GET", "/v1/auth/google/start", async (request) => handleOauthStart(request, deps.env, "google"));
  router.on("GET", "/v1/auth/google/callback", async (request) =>
    handleOauthCallback(deps.authStore, request, deps.env, "google"),
  );
  router.on("GET", "/v1/auth/github/start", async (request) => handleOauthStart(request, deps.env, "github"));
  router.on("GET", "/v1/auth/github/callback", async (request) =>
    handleOauthCallback(deps.authStore, request, deps.env, "github"),
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

  router.on("GET", "/v1/usage", async (request) => {
    const product = await deps.auth.requireProduct(request);
    const range = parseRange(new URL(request.url).searchParams.get("range"));
    const window = rangeWindow(range);
    const events = await deps.ledger.list(product.id, window.from, window.to);
    return json(aggregateUsage(events, range, window));
  });

  return router;
}

export function createDefaultDeps(env: Env): AppDeps {
  const seed = defaultSeed();
  if (isProduction(env)) {
    for (const product of seed.products) {
      product.apiKeys = [];
    }
  }
  const catalog = new MemoryCatalog(seed);
  const keys = createKeyStore(env);
  const authStore = createAuthStore(env);
  const adapters = new AdapterRegistry()
    .register(new EchoAdapter())
    .register(new HttpAdapter())
    .register(new OpenAiCompatAdapter())
    .register(new FalAdapter())
    .register(new VolcengineAdapter());

  return {
    catalog,
    keys,
    authStore,
    auth: new GatewayAuth(catalog, keys, authStore, env),
    quota: new PassthroughQuota(),
    ledger: createLedger(env),
    adapters,
    env,
  };
}

export function createDefaultApp(env: Env): Router {
  return createApp(createDefaultDeps(env));
}
