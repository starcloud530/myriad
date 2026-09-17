import { MyriadClientError } from "./error.ts";
import type {
  CapabilityId,
  CapabilityInputs,
  CapabilityOutputs,
  InvokeSuccess,
  ProductKey,
  PublicCapability,
} from "./types.ts";

export interface MyriadOptions {
  /** 网关 origin，不要带尾斜杠。浏览器里可传当前站点，走 Vite `/v1` 代理。 */
  baseUrl: string;
  /** 北向产品密钥。控制台签发，或开发种子 `dev-key`。 */
  apiKey: string;
  fetch?: typeof fetch;
}

/**
 * 万象客户端。下游服务只拿这一层，不要 import `@myriad/gateway`。
 *
 * @example
 * ```ts
 * const myriad = createMyriad({
 *   baseUrl: "http://127.0.0.1:8791",
 *   apiKey: process.env.MYRIAD_KEY ?? "dev-key",
 * });
 * const reply = await myriad.invoke("chat", {
 *   messages: [{ role: "user", content: "用一句话介绍万象" }],
 * });
 * ```
 */
export class Myriad {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: MyriadOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetch ?? fetch;
  }

  /** `GET /health`，不鉴权。 */
  async health(): Promise<{ ok: boolean; name: string; name_zh: string }> {
    return this.request("GET", "/health", { auth: false }) as Promise<{
      ok: boolean;
      name: string;
      name_zh: string;
    }>;
  }

  /** 当前产品能打的能力清单。渠道 config 已被剥掉。 */
  async listCapabilities(): Promise<PublicCapability[]> {
    const body = (await this.request("GET", "/v1/capabilities")) as { capabilities: PublicCapability[] };
    return body.capabilities;
  }

  async getCapability(id: string): Promise<PublicCapability> {
    const body = (await this.request("GET", `/v1/capabilities/${encodeURIComponent(id)}`)) as {
      capability: PublicCapability;
    };
    return body.capability;
  }

  /**
   * `POST /v1/capabilities/:id`。已知能力有入参类型；未知 id 退回宽松对象。
   * `channel` 仅调试，生产路由不认客户端指定。
   */
  invoke<K extends keyof CapabilityInputs>(
    id: K,
    input: CapabilityInputs[K],
    options?: { channel?: string },
  ): Promise<InvokeSuccess<CapabilityOutputs[K]>>;
  invoke(id: CapabilityId, input: Record<string, unknown>, options?: { channel?: string }): Promise<InvokeSuccess>;
  async invoke(
    id: string,
    input: Record<string, unknown>,
    options?: { channel?: string },
  ): Promise<InvokeSuccess> {
    return (await this.request("POST", `/v1/capabilities/${encodeURIComponent(id)}`, {
      body: options?.channel ? { input, channel: options.channel } : { input },
    })) as InvokeSuccess;
  }

  /** 列出当前产品下的密钥。明文不会再出现，只有创建/重置那一次。 */
  async listKeys(): Promise<ProductKey[]> {
    const body = (await this.request("GET", "/v1/keys")) as { keys: ProductKey[] };
    return body.keys;
  }

  async createKey(input: { tag: string; description?: string }): Promise<ProductKey> {
    const body = (await this.request("POST", "/v1/keys", { body: input })) as { key: ProductKey };
    return body.key;
  }

  async updateKey(
    id: string,
    input: { tag?: string; description?: string; status?: "active" | "disabled" },
  ): Promise<ProductKey> {
    const body = (await this.request("PATCH", `/v1/keys/${encodeURIComponent(id)}`, { body: input })) as {
      key: ProductKey;
    };
    return body.key;
  }

  async rotateKey(id: string): Promise<ProductKey> {
    const body = (await this.request("POST", `/v1/keys/${encodeURIComponent(id)}/rotate`)) as { key: ProductKey };
    return body.key;
  }

  async deleteKey(id: string): Promise<void> {
    await this.request("DELETE", `/v1/keys/${encodeURIComponent(id)}`);
  }

  private async request(
    method: string,
    path: string,
    init?: { body?: unknown; auth?: boolean },
  ): Promise<unknown> {
    const headers = new Headers();
    if (init?.auth !== false) {
      headers.set("authorization", `Bearer ${this.apiKey}`);
    }
    if (init?.body !== undefined) {
      headers.set("content-type", "application/json");
    }
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
    const text = await response.text();
    const body = text ? (JSON.parse(text) as unknown) : null;
    if (!response.ok) {
      throw new MyriadClientError(response.status, body);
    }
    return body;
  }
}

/** 工厂。和 `new Myriad(options)` 等价，方便树摇与测试注入。 */
export function createMyriad(options: MyriadOptions): Myriad {
  return new Myriad(options);
}
