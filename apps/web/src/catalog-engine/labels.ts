import type { Locale } from "../i18n/locale.ts";
import { modelKey } from "./spec.ts";
import type { ModelRecord } from "./spec.ts";

const vendors: Record<string, { en: string; zh: string }> = {
  myriad: { en: "Myriad", zh: "万象" },
  deepseek: { en: "DeepSeek", zh: "DeepSeek" },
  qianwen: { en: "Qwen", zh: "通义千问" },
  fal: { en: "fal", zh: "fal" },
  volcengine: { en: "Volcengine", zh: "火山方舟" },
};

const models: Record<string, { en: string; zh: string }> = {
  "deepseek/deepseek-flash": { en: "DeepSeek Flash", zh: "DeepSeek Flash" },
  "deepseek/deepseek-v4-pro": { en: "DeepSeek V4 Pro", zh: "DeepSeek V4 Pro" },
  "fal/gpt-image-2": { en: "GPT Image 2", zh: "GPT Image 2" },
  "fal/gpt-image-2-edit": { en: "GPT Image 2 Edit", zh: "GPT Image 2 编辑" },
  "fal/minimax-hailuo-02-pro": { en: "MiniMax Hailuo 02 Pro", zh: "MiniMax 海螺 02 Pro" },
  "fal/minimax-speech": { en: "MiniMax Speech 2.8 Turbo", zh: "MiniMax 语音 2.8 Turbo" },
  "fal/minimax-speech-hd": { en: "MiniMax Speech 2.8 HD", zh: "MiniMax 语音 2.8 HD" },
  "fal/minimax-video": { en: "MiniMax Video 01", zh: "MiniMax 视频 01" },
  "myriad/myriad-calorie": { en: "Calorie recognition", zh: "卡路里识别" },
  "myriad/myriad-nsfw": { en: "Sensitive-content check", zh: "图像敏感内容检测" },
  "myriad/myriad-portrait-quality": { en: "Portrait quality score", zh: "人像图片质量打分" },
  "qianwen/qwen-flash": { en: "Qwen Flash", zh: "通义千问 Flash" },
  "qianwen/qwen-long": { en: "Qwen Long", zh: "通义千问 Long" },
  "qianwen/qwen-max": { en: "Qwen Max", zh: "通义千问 Max" },
  "qianwen/qwen-plus": { en: "Qwen Plus", zh: "通义千问 Plus" },
  "qianwen/qwen-turbo": { en: "Qwen Turbo", zh: "通义千问 Turbo" },
  "qianwen/qwen3-max": { en: "Qwen 3 Max", zh: "通义千问 3 Max" },
  "volcengine/doubao-seedance-2-0": { en: "Doubao Seedance 2.0", zh: "豆包 Seedance 2.0" },
  "volcengine/doubao-seedance-2-5": { en: "Doubao Seedance 2.5", zh: "豆包 Seedance 2.5" },
  "volcengine/seedance": { en: "Seedance", zh: "Seedance" },
};

export function vendorLabel(vendor: string, locale: Locale): string {
  return vendors[vendor]?.[locale] ?? vendor;
}

export function modelLabel(model: Pick<ModelRecord, "vendor" | "id" | "name">, locale: Locale): string {
  return models[modelKey(model)]?.[locale] ?? model.name;
}

export function catalogSearchText(model: ModelRecord): string {
  const pair = models[modelKey(model)];
  const vendor = vendors[model.vendor];
  return [
    model.id,
    model.name,
    model.vendor,
    model.vendor_model,
    model.capability,
    model.description,
    pair?.en,
    pair?.zh,
    vendor?.en,
    vendor?.zh,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
