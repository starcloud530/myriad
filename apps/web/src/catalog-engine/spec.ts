export type ModelKind =
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

export type ModelModality = "text" | "image" | "audio" | "video" | "multimodal";
export type ModelMode = "sync" | "async";
export type PricingUnit = "token" | "image" | "audio_second" | "video_second" | "request";

export const ABILITY_IDS = [
  "playground",
  "thinking",
  "structured_output",
  "cache",
  "batch",
  "vision",
  "reference",
  "fine_tune",
] as const;

export type AbilityId = (typeof ABILITY_IDS)[number];

export const TOOL_IDS = ["function_call", "web_search", "mcp", "knowledge"] as const;

export type ToolId = (typeof TOOL_IDS)[number];

export interface ModelIo {
  input: ModelModality[];
  output: ModelModality[];
}

export interface MoneyPerMillion {
  cny_per_million: number | null;
}

export interface MoneyPerUnit {
  cny_per_unit: number | null;
}

export interface ModelPricing {
  unit: PricingUnit;
  currency: string;
  as_of?: string;
  source?: "official" | "estimate";
  prompt?: MoneyPerMillion;
  completion?: MoneyPerMillion;
  cache_read?: MoneyPerMillion;
  image?: MoneyPerUnit;
  second?: MoneyPerUnit;
}

export interface ModelLineage {
  origin: string;
  origin_model: string;
}

export interface ModelSpecs {
  context_length?: number;
  max_input?: number;
  max_output?: number;
  tpm?: number;
  rpm?: number;
}

export interface ModelRecord {
  id: string;
  vendor: string;
  name: string;
  vendor_model: string;
  kind: ModelKind;
  modality: ModelModality;
  mode: ModelMode;
  capability: string;
  enabled: boolean;
  description: string;
  docs?: string;
  io: ModelIo;
  abilities: Partial<Record<AbilityId, boolean>>;
  tools: Partial<Record<ToolId, boolean>>;
  lineage?: ModelLineage;
  specs?: ModelSpecs;
  pricing: ModelPricing;
}

export function modelHref(model: Pick<ModelRecord, "vendor" | "id">): string {
  return `/playground/${encodeURIComponent(model.vendor)}/${encodeURIComponent(model.id)}`;
}

export function modelTryHref(model: Pick<ModelRecord, "vendor" | "id">): string {
  return `${modelHref(model)}/try`;
}

export function modelKey(model: Pick<ModelRecord, "vendor" | "id">): string {
  return `${model.vendor}/${model.id}`;
}
