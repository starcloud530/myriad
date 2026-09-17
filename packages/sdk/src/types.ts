/**
 * 北向合同类型。只描述下游看得到的形状，不包含渠道 config / 厂商 Key。
 * 和网关 `packages/gateway/src/protocol` 对齐；不要从网关 import。
 */

/** 七族协议。新服务先对上这里，不要另开合同。 */
export type ProtocolKind =
  | "chat"
  | "complete"
  | "generate.image"
  | "generate.video"
  | "generate.audio"
  | "transduce"
  | "score.classify"
  | "score.regress"
  | "score.embed"
  | "extract"
  | "realtime";

/** 已接通能力。调用路径是 `/v1/capabilities/${id}`。 */
export const CapabilityIds = {
  chat: "chat",
  imageGenerate: "image.generate",
  videoGenerate: "video.generate",
  audioSpeech: "audio.speech",
  imageNsfw: "image-nsfw",
  portraitQuality: "portrait-quality",
  calorieRecognize: "calorie-recognize",
} as const;

export type CapabilityId = (typeof CapabilityIds)[keyof typeof CapabilityIds] | (string & {});

export type MediaKind = "image" | "audio" | "video" | "file";

export interface MediaRef {
  kind: MediaKind;
  uri: string;
  mime?: string;
}

export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ChatMessage {
  role: ChatRole;
  content: string | Array<{ type: "text"; text: string } | { type: "media"; media: MediaRef }>;
  tool_call_id?: string;
}

export interface ChatInput {
  messages: ChatMessage[];
  tools?: Array<{ name: string; description?: string; parameters?: Record<string, unknown> }>;
  stream?: boolean;
}

export interface ChatOutput {
  message: {
    role: "assistant";
    content: string;
    tool_calls?: Array<{ id: string; name: string; arguments: Record<string, unknown> }>;
  };
}

export interface ImageGenerateInput {
  prompt: string;
  n?: number;
  size?: string;
  /** 有 refs 走图生图，最多 16 张。 */
  refs?: MediaRef[];
}

export interface ImageGenerateOutput {
  images: MediaRef[];
}

export interface VideoGenerateInput {
  prompt: string;
  duration_s?: number;
  refs?: MediaRef[];
}

export interface VideoGenerateOutput {
  job_id?: string;
  status?: "queued" | "running" | "succeeded" | "failed";
  video?: MediaRef;
}

export interface AudioSpeechInput {
  text: string;
  voice?: { id: string } | { ref: MediaRef };
}

export interface AudioSpeechOutput {
  audio: MediaRef;
}

export interface ClassifyInput {
  input: string | MediaRef;
  labels?: string[];
}

export interface ClassifyOutput {
  labels: Array<{ label: string; score: number }>;
}

export interface RegressInput {
  input: string | MediaRef;
}

export interface RegressOutput {
  value: number;
  vector?: number[];
}

export interface ExtractInput {
  source: MediaRef;
  task: "ocr" | "detect" | "segment";
}

export interface ExtractOutput {
  instances: Array<{
    label?: string;
    text?: string;
    score?: number;
    box?: [number, number, number, number];
  }>;
}

export interface Usage {
  units: number;
  unit: "token" | "image" | "audio_second" | "video_second" | "request";
}

/** 每次成功调用的信封。channel 是实际出站，不是客户端指定结果。 */
export interface InvokeSuccess<TOutput = unknown> {
  request_id: string;
  capability: string;
  kind: ProtocolKind;
  channel: string;
  output: TOutput;
  usage: Usage;
}

export interface PublicChannel {
  id: string;
  adapter: string;
  role: "primary" | "fallback";
  enabled: boolean;
  vendor: string;
  vendor_model?: string;
}

export interface PublicCapability {
  id: string;
  name: string;
  kind: ProtocolKind;
  modality: string;
  mode: "sync" | "async";
  billing: { unit: Usage["unit"]; cny_per_unit?: number };
  enabled: boolean;
  channels: PublicChannel[];
  description?: string;
}

export interface ProductKey {
  id: string;
  product_id: string;
  tag: string;
  description: string;
  prefix: string;
  last4: string;
  status: "active" | "disabled";
  created_at: string;
  system: boolean;
  secret?: string;
}

export interface CapabilityInputs {
  chat: ChatInput;
  "image.generate": ImageGenerateInput;
  "video.generate": VideoGenerateInput;
  "audio.speech": AudioSpeechInput;
  "image-nsfw": ClassifyInput;
  "portrait-quality": RegressInput;
  "calorie-recognize": ExtractInput;
}

export interface CapabilityOutputs {
  chat: ChatOutput;
  "image.generate": ImageGenerateOutput;
  "video.generate": VideoGenerateOutput;
  "audio.speech": AudioSpeechOutput;
  "image-nsfw": ClassifyOutput;
  "portrait-quality": RegressOutput;
  "calorie-recognize": ExtractOutput;
}

export interface MyriadErrorBody {
  error: { code: string; message: string };
  request_id?: string;
}
