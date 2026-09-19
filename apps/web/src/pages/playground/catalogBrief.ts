import { modelLabel, vendorLabel } from "../../catalog-engine/labels.ts";
import type { FxQuote } from "../../catalog-engine/fx.ts";
import { priceSummary } from "../../catalog-engine/price.ts";
import type { ModelRecord } from "../../catalog-engine/spec.ts";
import type { Locale } from "../../i18n/locale.ts";
import type { Messages } from "../../i18n/messages.ts";

export function catalogBrief(models: ModelRecord[], locale: Locale, copy: Messages, fx: FxQuote): string {
  return models
    .map((model) => {
      const name = modelLabel(model, locale);
      const vendor = vendorLabel(model.vendor, locale);
      const price = priceSummary(model.pricing, copy, locale, fx);
      const about = model.description.replace(/\s+/g, " ").slice(0, 140);
      return `- ${model.vendor}/${model.id} · ${name} · ${vendor} · ${model.modality} · ${model.kind} · ${price} · ${about}`;
    })
    .join("\n");
}

export function pickModels(query: string, models: ModelRecord[]): ModelRecord[] {
  const q = query.toLowerCase();
  const hit = (needles: string[]): ModelRecord[] =>
    models.filter((model) => {
      const hay = `${model.id} ${model.name} ${model.vendor} ${model.kind} ${model.modality} ${model.description}`.toLowerCase();
      return needles.some((needle) => hay.includes(needle) || q.includes(needle));
    });

  if (/图|image|生图|海报|修图|edit|seedream|万相|wan/.test(q)) {
    return hit(["image", "generate.image", "gpt-image", "seedream", "qwen-image", "wan2.7-image"]).slice(0, 4);
  }
  if (/视频|video|seedance|hailuo|h3|万相|wan/.test(q)) {
    return hit(["video", "seedance", "hailuo", "h3", "wan2.7-t2v"]).slice(0, 4);
  }
  if (/语音|speech|audio|配音|朗读/.test(q)) {
    return hit(["audio", "speech"]).slice(0, 3);
  }
  if (/卡路里|calorie|减肥|食物/.test(q)) {
    return hit(["calorie"]).slice(0, 2);
  }
  if (/黄|nsfw|敏感|鉴黄/.test(q)) {
    return hit(["nsfw"]).slice(0, 2);
  }
  if (/人像|portrait|颜值/.test(q)) {
    return hit(["portrait"]).slice(0, 2);
  }
  if (/便宜|cheap|flash|turbo|低价/.test(q)) {
    return hit(["flash", "turbo"]).slice(0, 3);
  }
  if (/长文|long|十万|百万上下文|10m/.test(q)) {
    return hit(["long", "qwen-long"]).slice(0, 2);
  }
  return models.filter((model) => model.kind === "chat").slice(0, 3);
}
