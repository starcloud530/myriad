import { AdapterKinds } from "../domain/ids.ts";
import { ChannelFailedError } from "../domain/errors.ts";
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
    const input = request.input as unknown as VideoGenerateInput;

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
      throw new ChannelFailedError(request.channel.id, body.error?.message ?? `volcengine ${response.status}`);
    }
    return {
      job_id: body.id ?? crypto.randomUUID(),
      status: "queued",
    };
  }
}
