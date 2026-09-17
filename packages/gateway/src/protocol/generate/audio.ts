import { ProtocolError } from "../envelope.ts";
import type { MediaRef } from "../media.ts";

/** TTS 与克隆朗读同一合同。登记音色是目录资源，不在这里。 */
export interface AudioSpeechInput {
  text: string;
  voice?: { id: string } | { ref: MediaRef };
}

export interface AudioSpeechOutput {
  audio: MediaRef;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseAudioSpeechInput(input: unknown): AudioSpeechInput {
  if (!isRecord(input) || typeof input.text !== "string" || !input.text.trim()) {
    throw new ProtocolError(400, "bad_request", "audio.speech text is required");
  }
  return { text: input.text };
}
