import { AdapterKinds } from "../domain/ids.ts";
import { ChannelFailedError } from "../domain/errors.ts";
import { ProtocolKinds } from "../protocol/kind.ts";
import type { AudioSpeechInput } from "../protocol/generate/audio.ts";
import type { ImageGenerateInput } from "../protocol/generate/image.ts";
import type { VideoGenerateInput } from "../protocol/generate/video.ts";
import type { AdapterRequest, ChannelAdapter } from "./types.ts";
import { readSecretEnv, readString } from "./secret.ts";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

export class FalAdapter implements ChannelAdapter {
  readonly kind = AdapterKinds.fal;

  async invoke(request: AdapterRequest): Promise<unknown> {
    const apiKey = readSecretEnv(request.env, request.channel.config, request.channel.id);
    const model = this.modelOf(request);
    const payload = this.payloadOf(request);
    const queued = request.capability.kind === ProtocolKinds.videoGenerate;
    const url = queued ? `https://queue.fal.run/${model}` : `https://fal.run/${model}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `Key ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const body = asRecord(await response.json());
    if (!response.ok) {
      const detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body);
      throw new ChannelFailedError(request.channel.id, detail || `fal ${response.status}`);
    }

    if (queued) {
      const jobId = typeof body.request_id === "string" ? body.request_id : crypto.randomUUID();
      return { job_id: jobId, status: "queued" };
    }

    if (request.capability.kind === ProtocolKinds.imageGenerate) {
      const images = this.collectUris(body, "image", "images");
      return { images };
    }
    if (request.capability.kind === ProtocolKinds.audioSpeech) {
      const audio = this.collectUris(body, "audio", "audio")[0];
      if (!audio) {
        throw new ChannelFailedError(request.channel.id, "fal speech returned no audio");
      }
      return { audio };
    }
    return body;
  }

  private modelOf(request: AdapterRequest): string {
    const input = request.input as unknown as ImageGenerateInput;
    if (request.capability.kind === ProtocolKinds.imageGenerate && input.refs?.length) {
      return readString(request.channel.config, "edit_model") ?? "fal-ai/gpt-image-2/edit";
    }
    const model = readString(request.channel.config, "vendor_model");
    if (!model) {
      throw new ChannelFailedError(request.channel.id, "fal channel missing vendor_model");
    }
    return model;
  }

  private payloadOf(request: AdapterRequest): Record<string, unknown> {
    if (request.capability.kind === ProtocolKinds.imageGenerate) {
      const input = request.input as unknown as ImageGenerateInput;
      const payload: Record<string, unknown> = { prompt: input.prompt };
      if (input.n) payload.num_images = input.n;
      if (input.size) payload.image_size = input.size;
      if (input.refs?.length) payload.image_urls = input.refs.map((ref) => ref.uri);
      return payload;
    }
    if (request.capability.kind === ProtocolKinds.audioSpeech) {
      const input = request.input as unknown as AudioSpeechInput;
      return { text: input.text };
    }
    const input = request.input as unknown as VideoGenerateInput;
    return { prompt: input.prompt };
  }

  private collectUris(body: Record<string, unknown>, kind: "image" | "audio", key: string): Array<{ kind: "image" | "audio"; uri: string }> {
    const bucket = body[key];
    const items = Array.isArray(bucket) ? bucket : bucket ? [bucket] : [];
    return items.flatMap((item) => {
      if (typeof item === "string") return [{ kind, uri: item }];
      const rec = asRecord(item);
      const uri = typeof rec.url === "string" ? rec.url : typeof rec.uri === "string" ? rec.uri : "";
      return uri ? [{ kind, uri }] : [];
    });
  }
}
