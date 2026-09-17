/**
 * `@myriad/sdk` — 万象北向 TypeScript 客户端。
 *
 * 其他 TS 服务只依赖本包。不要依赖 `@myriad/gateway`，也不要按厂商建 generate 类。
 */
export { createMyriad, Myriad, type MyriadOptions } from "./client.ts";
export { MyriadClientError } from "./error.ts";
export { CapabilityIds } from "./types.ts";
export type {
  AudioSpeechInput,
  AudioSpeechOutput,
  CapabilityId,
  CapabilityInputs,
  CapabilityOutputs,
  ChatInput,
  ChatMessage,
  ChatOutput,
  ClassifyInput,
  ClassifyOutput,
  ExtractInput,
  ExtractOutput,
  ImageGenerateInput,
  ImageGenerateOutput,
  InvokeSuccess,
  MediaRef,
  ProductKey,
  ProtocolKind,
  PublicCapability,
  PublicChannel,
  RegressInput,
  RegressOutput,
  Usage,
  VideoGenerateInput,
  VideoGenerateOutput,
} from "./types.ts";
