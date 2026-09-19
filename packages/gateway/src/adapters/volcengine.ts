import { AdapterKinds } from "../domain/ids.ts";
import { ChannelFailedError } from "../domain/errors.ts";
import { ProtocolKinds } from "../protocol/kind.ts";
import type { ImageGenerateInput } from "../protocol/generate/image.ts";
import type { VideoGenerateInput } from "../protocol/generate/video.ts";
import type { AdapterRequest, ChannelAdapter } from "./types.ts";
import { readSecretEnv, readString } from "./secret.ts";

export class VolcengineAdapter implements ChannelAdapter {
  readonly kind = AdapterKinds.volcengine;

  async invoke(request: AdapterRequest): Promise<unknown> {
    const baseUrl = (readString(request.channel.config, "base_url") ?? "").replace(/\/$/, "");
    const model = readString(request.channel.config, "vendor_model");
    if (!baseUrl || !model) {
      throw new ChannelFailedError(request.channel.id, "volcengine missing base_url or vendor_model");
    }
    const apiKey = readSecretEnv(request.env, request.channel.config, request.channel.id);
    if (request.capability.kind === ProtocolKinds.imageGenerate) {
      return this.generateImage(baseUrl, model, apiKey, request.input as unknown as ImageGenerateInput, request.channel.id);
    }
    return this.generateVideo(baseUrl, model, apiKey, request.input as unknown as VideoGenerateInput, request.channel.id);
  }

  private async generateImage(
    baseUrl: string,
    model: string,
    apiKey: string,
    input: ImageGenerateInput,
    channelId: string,
  ): Promise<unknown> {
    const body: Record<string, unknown> = {
      model,
      prompt: input.prompt,
      watermark: false,
    };
    if (input.size) {
      body.size = input.size;
    }
    if (input.refs?.length === 1) {
      body.image = input.refs[0].uri;
    } else if (input.refs && input.refs.length > 1) {
      body.image = input.refs.map((ref) => ref.uri);
    }

    const response = await fetch(`${baseUrl}/images/generations`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as {
      data?: Array<{ url?: string }>;
      error?: { message?: string };
    };
    if (!response.ok) {
      throw new ChannelFailedError(channelId, payload.error?.message ?? `volcengine ${response.status}`);
    }
    const images = (payload.data ?? [])
      .map((item) => item.url)
      .filter((url): url is string => Boolean(url))
      .map((uri) => ({ kind: "image" as const, uri }));
    if (images.length === 0) {
      throw new ChannelFailedError(channelId, "volcengine image returned no url");
    }
    return { images };
  }

  private async generateVideo(
    baseUrl: string,
    model: string,
    apiKey: string,
    input: VideoGenerateInput,
    channelId: string,
  ): Promise<unknown> {
    const response = await fetch(`${baseUrl}/contents/generations/tasks`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        content: [{ type: "text", text: input.prompt }],
      }),
    });
    const body = (await response.json()) as { id?: string; error?: { message?: string } };
    if (!response.ok) {
      throw new ChannelFailedError(channelId, body.error?.message ?? `volcengine ${response.status}`);
    }
    return {
      job_id: body.id ?? crypto.randomUUID(),
      status: "queued",
    };
  }
}
