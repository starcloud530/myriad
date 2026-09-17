import { ProtocolError, type JobRef } from "../envelope.ts";
import type { MediaRef } from "../media.ts";

/** 生视频几乎必是 job，不要假装同步。 */
export interface VideoGenerateInput {
  prompt: string;
  duration_s?: number;
  refs?: MediaRef[];
}

export type VideoGenerateOutput = JobRef | { video: MediaRef };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRefs(value: unknown): MediaRef[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new ProtocolError(400, "bad_request", "refs must be an array");
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

export function parseVideoGenerateInput(input: unknown): VideoGenerateInput {
  if (!isRecord(input) || typeof input.prompt !== "string" || !input.prompt.trim()) {
    throw new ProtocolError(400, "bad_request", "video.generate prompt is required");
  }
  return {
    prompt: input.prompt,
    duration_s: typeof input.duration_s === "number" ? input.duration_s : undefined,
    refs: parseRefs(input.refs),
  };
}
