import { parse } from "yaml";
import { catalogSearchText } from "./labels.ts";
import type {
  AbilityId,
  ModelIo,
  ModelKind,
  ModelModality,
  ModelMode,
  ModelPricing,
  ModelRecord,
  ModelSpecs,
  PricingUnit,
  ToolId,
} from "./spec.ts";
import { ABILITY_IDS, TOOL_IDS } from "./spec.ts";

const rawModules = import.meta.glob("../../../../catalog/models/*/*.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const modalities = new Set<ModelModality>(["text", "image", "audio", "video", "multimodal"]);
const abilitySet = new Set<string>(ABILITY_IDS);
const toolSet = new Set<string>(TOOL_IDS);

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
  const specsRaw = row.specs && typeof row.specs === "object" ? (row.specs as Record<string, unknown>) : undefined;
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
    io: parseIo(row.io) ?? fallbackIo(kind, modality),
    abilities: parseFlags(row.abilities, abilitySet) as Partial<Record<AbilityId, boolean>>,
    tools: parseFlags(row.tools, toolSet) as Partial<Record<ToolId, boolean>>,
    lineage: (() => {
      const origin = asString(lineageRaw?.origin);
      const origin_model = asString(lineageRaw?.origin_model);
      return origin && origin_model ? { origin, origin_model } : undefined;
    })(),
    specs: parseSpecs(specsRaw),
    pricing,
  };
}

function parseModalities(raw: unknown): ModelModality[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item): item is ModelModality => modalities.has(item as ModelModality));
}

function parseIo(raw: unknown): ModelIo | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }
  const row = raw as { input?: unknown; output?: unknown };
  const input = parseModalities(row.input);
  const output = parseModalities(row.output);
  if (input.length === 0 || output.length === 0) {
    return undefined;
  }
  return { input, output };
}

function fallbackIo(kind: ModelKind, modality: ModelModality): ModelIo {
  if (kind === "generate.image") {
    return { input: modality === "image" ? ["text", "image"] : ["text"], output: ["image"] };
  }
  if (kind === "generate.video") {
    return { input: ["text"], output: ["video"] };
  }
  if (kind === "generate.audio") {
    return { input: ["text"], output: ["audio"] };
  }
  if (kind === "transduce") {
    return { input: ["audio"], output: ["text"] };
  }
  if (kind === "chat" || kind === "complete") {
    return { input: [modality === "multimodal" ? "text" : modality], output: ["text"] };
  }
  return { input: [modality], output: ["text"] };
}

function parseFlags(raw: unknown, allowed: Set<string>): Record<string, boolean> {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  const flags: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (allowed.has(key) && typeof value === "boolean") {
      flags[key] = value;
    }
  }
  return flags;
}

function parseSpecs(raw: Record<string, unknown> | undefined): ModelSpecs | undefined {
  if (!raw) {
    return undefined;
  }
  const specs: ModelSpecs = {};
  const context = asNumber(raw.context_length);
  const maxInput = asNumber(raw.max_input);
  const maxOutput = asNumber(raw.max_output);
  const tpm = asNumber(raw.tpm);
  const rpm = asNumber(raw.rpm);
  if (context != null) {
    specs.context_length = context;
  }
  if (maxInput != null) {
    specs.max_input = maxInput;
  }
  if (maxOutput != null) {
    specs.max_output = maxOutput;
  }
  if (tpm != null) {
    specs.tpm = tpm;
  }
  if (rpm != null) {
    specs.rpm = rpm;
  }
  return Object.keys(specs).length ? specs : undefined;
}

const loaded: ModelRecord[] = [];
for (const [path, text] of Object.entries(rawModules)) {
  if (path.includes("/_template.yaml")) {
    continue;
  }
  const model = parseModel(parse(text));
  if (model?.enabled) {
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
    const hay = catalogSearchText(model);
    return hay.includes(needle);
  });
}
