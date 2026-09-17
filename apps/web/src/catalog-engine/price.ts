import type { ModelPricing, ModelRecord } from "./spec.ts";

export const modalityLabel: Record<ModelRecord["modality"], string> = {
  text: "文本",
  image: "图像",
  audio: "音频",
  video: "视频",
  multimodal: "多模态",
};

export const modeLabel: Record<ModelRecord["mode"], string> = {
  sync: "同步",
  async: "异步 job",
};

function yuan(value: number): string {
  return Number.isInteger(value) ? `¥${value}` : `¥${value}`;
}

export function priceSummary(pricing: ModelPricing): string {
  if (pricing.unit === "token") {
    const prompt = pricing.prompt?.cny_per_million;
    const completion = pricing.completion?.cny_per_million;
    if (prompt != null && completion != null) {
      return `输入 ${yuan(prompt)} / 百万 · 输出 ${yuan(completion)} / 百万`;
    }
    if (prompt != null) {
      return `输入 ${yuan(prompt)} / 百万 token`;
    }
    return "按 token 计费";
  }
  if (pricing.unit === "image") {
    const amount = pricing.image?.cny_per_unit;
    return amount == null ? "按张计费" : `${yuan(amount)} / 张`;
  }
  if (pricing.unit === "audio_second" || pricing.unit === "video_second") {
    const amount = pricing.second?.cny_per_unit;
    const unit = pricing.unit === "audio_second" ? "音频秒" : "视频秒";
    return amount == null ? `按${unit}计费` : `${yuan(amount)} / ${unit}`;
  }
  return "按次计费";
}

export function modelTags(model: ModelRecord): string[] {
  const tags = [modalityLabel[model.modality], modeLabel[model.mode], priceSummary(model.pricing)];
  if (model.vendor === "myriad") {
    tags.push("自建");
  }
  if (model.pricing.source === "estimate") {
    tags.push("估价");
  }
  if (!model.enabled) {
    tags.push("已停用");
  }
  return tags;
}
