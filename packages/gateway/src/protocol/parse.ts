import { parseChatInput } from "./chat/parse.ts";
import { parseAudioSpeechInput } from "./generate/audio.ts";
import { parseImageGenerateInput } from "./generate/image.ts";
import { parseVideoGenerateInput } from "./generate/video.ts";
import { ProtocolKinds, type ProtocolKind } from "./kind.ts";

/** 按 kind 收窄 unknown。未实现的合同先 400，避免 silently 当 bag 用。 */
export function parseInput(kind: ProtocolKind, input: unknown): unknown {
  switch (kind) {
    case ProtocolKinds.chat:
      return parseChatInput(input);
    case ProtocolKinds.imageGenerate:
      return parseImageGenerateInput(input);
    case ProtocolKinds.videoGenerate:
      return parseVideoGenerateInput(input);
    case ProtocolKinds.audioSpeech:
      return parseAudioSpeechInput(input);
    default:
      return input;
  }
}
