export type Modality = "image" | "text" | "multimodal" | "audio" | "video";
export type InvokeMode = "sync" | "async";
export type BillingUnit = "image" | "request" | "token" | "audio_second" | "video_second";
export type ChannelRole = "primary" | "fallback";
export type AdapterKind = "echo" | "http" | "openai_compat" | "fal" | "volcengine";
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

export interface BillingSpec {
  unit: BillingUnit;
  cny_per_unit?: number;
}

export interface PublicChannel {
  id: string;
  adapter: AdapterKind;
  role: ChannelRole;
  enabled: boolean;
  vendor: string;
  vendor_model?: string;
}

export interface PublicCapability {
  id: string;
  name: string;
  kind: ProtocolKind;
  modality: Modality;
  mode: InvokeMode;
  billing: BillingSpec;
  enabled: boolean;
  channels: PublicChannel[];
  description?: string;
}

export interface CatalogResponse {
  capabilities: PublicCapability[];
}

export interface CapabilityResponse {
  capability: PublicCapability;
}
