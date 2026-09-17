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
  lineage?: ModelLineage;
  specs?: ModelSpecs;
  pricing: ModelPricing;
}

export function modelHref(model: Pick<ModelRecord, "vendor" | "id">): string {
  return `/playground/${encodeURIComponent(model.vendor)}/${encodeURIComponent(model.id)}`;
}

export function modelKey(model: Pick<ModelRecord, "vendor" | "id">): string {
  return `${model.vendor}/${model.id}`;
}
