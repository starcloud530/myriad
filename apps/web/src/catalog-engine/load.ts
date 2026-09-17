import { parse } from "yaml";
import type { ModelKind, ModelModality, ModelMode, ModelPricing, ModelRecord, PricingUnit } from "./spec.ts";

const rawModules = import.meta.glob("../../../../catalog/models/*/*.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const kinds = new Set<ModelKind>([
  "chat",
  "complete",
  "generate.image",
  "generate.video",
  "generate.audio",
  "transduce",
  "score.classify",
  "score.regress",
  "score.embed",
  "extract",
  "realtime",
]);

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function moneyMillion(value: unknown): { cny_per_million: number | null } | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  return { cny_per_million: asNumber((value as { cny_per_million?: unknown }).cny_per_million) };
}

function moneyUnit(value: unknown): { cny_per_unit: number | null } | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  return { cny_per_unit: asNumber((value as { cny_per_unit?: unknown }).cny_per_unit) };
}

function parsePricing(raw: unknown): ModelPricing | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }
  const row = raw as Record<string, unknown>;
  const unit = asString(row.unit) as PricingUnit | undefined;
  if (!unit) {
    return undefined;
  }
  return {
    unit,
    currency: asString(row.currency) ?? "CNY",
    as_of: asString(row.as_of),
    source: row.source === "estimate" ? "estimate" : row.source === "official" ? "official" : undefined,
    prompt: moneyMillion(row.prompt),
    completion: moneyMillion(row.completion),
    cache_read: moneyMillion(row.cache_read),
    image: moneyUnit(row.image),
    second: moneyUnit(row.second),
  };
}

function parseModel(raw: unknown): ModelRecord | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }
  const row = raw as Record<string, unknown>;
  const id = asString(row.id);
  const vendor = asString(row.vendor);
  const name = asString(row.name);
  const vendor_model = asString(row.vendor_model);
  const kind = asString(row.kind) as ModelKind | undefined;
  const modality = asString(row.modality) as ModelModality | undefined;
  const mode = asString(row.mode) as ModelMode | undefined;
  const capability = asString(row.capability);
  const pricing = parsePricing(row.pricing);
  if (!id || !vendor || !name || !vendor_model || !kind || !modality || !mode || !capability || !pricing) {
    return undefined;
  }
  if (!kinds.has(kind)) {
    return undefined;
  }
  const specsRaw = row.specs && typeof row.specs === "object" ? (row.specs as { context_length?: unknown }) : undefined;
  const lineageRaw = row.lineage && typeof row.lineage === "object" ? (row.lineage as { origin?: unknown; origin_model?: unknown }) : undefined;
  return {
    id,
    vendor,
    name,
    vendor_model,
    kind,
    modality,
    mode,
    capability,
    enabled: row.enabled !== false,
    description: asString(row.description) ?? "",
    docs: asString(row.docs),
    lineage: (() => {
      const origin = asString(lineageRaw?.origin);
      const origin_model = asString(lineageRaw?.origin_model);
      return origin && origin_model ? { origin, origin_model } : undefined;
    })(),
    specs: specsRaw?.context_length != null && asNumber(specsRaw.context_length) != null
      ? { context_length: asNumber(specsRaw.context_length) ?? undefined }
      : undefined,
    pricing,
  };
}

const loaded: ModelRecord[] = [];
for (const [path, text] of Object.entries(rawModules)) {
  if (path.includes("/_template.yaml")) {
    continue;
  }
  const model = parseModel(parse(text));
  if (model) {
    loaded.push(model);
  }
}
loaded.sort((a, b) => a.vendor.localeCompare(b.vendor) || a.id.localeCompare(b.id));

export function listModels(): ModelRecord[] {
  return loaded;
}

export function getModel(vendor: string, id: string): ModelRecord | undefined {
  return loaded.find((model) => model.vendor === vendor && model.id === id);
}

export function filterModels(models: ModelRecord[], query: string, modality: "all" | ModelModality): ModelRecord[] {
  const needle = query.trim().toLowerCase();
  return models.filter((model) => {
    if (modality !== "all" && model.modality !== modality) {
      return false;
    }
    if (!needle) {
      return true;
    }
    const hay = [model.id, model.name, model.vendor, model.vendor_model, model.capability, model.description, model.kind]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}
