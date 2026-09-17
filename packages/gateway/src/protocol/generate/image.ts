import { ProtocolError } from "../envelope.ts";
import type { MediaRef } from "../media.ts";

export interface ImageGenerateInput {
  prompt: string;
  n?: number;
  size?: string;
  refs?: MediaRef[];
}

export interface ImageGenerateOutput {
  images: MediaRef[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRefs(value: unknown): MediaRef[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new ProtocolError(400, "bad_request", "refs must be an array");
  }
  if (value.length > 16) {
    throw new ProtocolError(400, "bad_request", "image.generate refs supports at most 16 images");
  }
  return value.map((item) => {
    if (!isRecord(item) || typeof item.uri !== "string") {
      throw new ProtocolError(400, "bad_request", "ref.uri is required");
    }
    return {
      kind: item.kind === "audio" || item.kind === "video" || item.kind === "file" ? item.kind : "image",
      uri: item.uri,
      mime: typeof item.mime === "string" ? item.mime : undefined,
    };
  });
}

export function parseImageGenerateInput(input: unknown): ImageGenerateInput {
  if (!isRecord(input) || typeof input.prompt !== "string" || !input.prompt.trim()) {
    throw new ProtocolError(400, "bad_request", "image.generate prompt is required");
  }
  return {
    prompt: input.prompt,
    n: typeof input.n === "number" ? input.n : undefined,
    size: typeof input.size === "string" ? input.size : undefined,
    refs: parseRefs(input.refs),
  };
}
