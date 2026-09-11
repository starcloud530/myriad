import { AdapterKinds } from "../domain/ids.ts";
import { ChannelFailedError } from "../domain/errors.ts";
import type { AdapterRequest, ChannelAdapter } from "./types.ts";

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asHeaders(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") {
    return {};
  }
  const headers: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string") {
      headers[key] = item;
    }
  }
  return headers;
}

/** 第三方 API 与自建 HTTP 服务共用。渠道只是不同的 url / headers。 */
export class HttpAdapter implements ChannelAdapter {
  readonly kind = AdapterKinds.http;

  async invoke(request: AdapterRequest): Promise<unknown> {
    const url = asString(request.channel.config?.url);
    if (!url) {
      throw new ChannelFailedError(request.channel.id, "http channel missing url");
    }

    const method = asString(request.channel.config?.method) ?? "POST";
    const headers = asHeaders(request.channel.config?.headers);
    const response = await fetch(url, {
      method,
      headers: {
        "content-type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        capability: request.capability.id,
        input: request.input,
      }),
    });

    if (!response.ok) {
      throw new ChannelFailedError(request.channel.id, `upstream ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    return { text: await response.text() };
  }
}
