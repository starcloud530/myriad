import type { Messages } from "../i18n/messages.ts";
import type { ModelPricing, ModelRecord } from "./spec.ts";

export function modalityLabel(copy: Messages): Record<ModelRecord["modality"], string> {
  return {
    text: copy.labels.text,
    image: copy.labels.image,
    audio: copy.labels.audio,
    video: copy.labels.video,
    multimodal: copy.labels.multimodal,
  };
}

export function modeLabel(copy: Messages): Record<ModelRecord["mode"], string> {
  return {
    sync: copy.labels.sync,
    async: copy.labels.async,
  };
}

function yuan(value: number): string {
  return `¥${value}`;
}

export function priceSummary(pricing: ModelPricing, copy: Messages): string {
  const labels = copy.labels;
  if (pricing.unit === "token") {
    const prompt = pricing.prompt?.cny_per_million;
    const completion = pricing.completion?.cny_per_million;
    if (prompt != null && completion != null) {
      return `${copy.detail.input} ${yuan(prompt)} ${labels.perMillion} · ${copy.detail.output} ${yuan(completion)} ${labels.perMillion}`;
    }
    if (prompt != null) {
      return `${copy.detail.input} ${yuan(prompt)} ${labels.perMillion} token`;
    }
    return labels.pricedToken;
  }
  if (pricing.unit === "image") {
    const amount = pricing.image?.cny_per_unit;
    return amount == null ? labels.pricedImage : `${yuan(amount)} ${labels.perImage}`;
  }
  if (pricing.unit === "audio_second" || pricing.unit === "video_second") {
    const amount = pricing.second?.cny_per_unit;
    const unit = pricing.unit === "audio_second" ? labels.audioSec : labels.videoSec;
    return amount == null ? `${unit}` : `${yuan(amount)} / ${unit}`;
  }
  return labels.pricedRequest;
}
