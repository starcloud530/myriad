import type { FxQuote } from "../../catalog-engine/fx.ts";
import { modelLabel, vendorLabel } from "../../catalog-engine/labels.ts";
import { modelKey } from "../../catalog-engine/spec.ts";
import type { ModelRecord } from "../../catalog-engine/spec.ts";
import type { Locale } from "../../i18n/locale.ts";
import type { Messages } from "../../i18n/messages.ts";
import { catalogBrief, pickModels } from "./catalogBrief.ts";

export function advisorModel(models: ModelRecord[]): ModelRecord | undefined {
  const chat = models.filter((model) => model.kind === "chat" && model.enabled);
  return chat.find((model) => /flash|turbo/.test(model.id)) ?? chat[0];
}

export function modelsFromText(text: string, models: ModelRecord[]): ModelRecord[] {
  return models.filter((model) => {
    const key = modelKey(model);
    return text.includes(key) || text.includes(model.id);
  });
}

export function mergePicks(query: string, reply: string, models: ModelRecord[]): ModelRecord[] {
  const named = modelsFromText(reply, models);
  const local = pickModels(query, models);
  const seen = new Set<string>();
  const next: ModelRecord[] = [];
  for (const model of [...named, ...local]) {
    const key = modelKey(model);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    next.push(model);
    if (next.length >= 3) {
      break;
    }
  }
  return next;
}

export function starterPrompt(query: string, model: ModelRecord | undefined, locale: Locale): string {
  const name = model ? modelLabel(model, locale) : locale === "zh" ? "这个模型" : "this model";
  if (locale === "zh") {
    return `你是 ${name}。用户要做：${query.trim()}。先把约束问清楚，再给可执行的结果。不要承诺这个模型没有的能力。`;
  }
  return `You are ${name}. The user wants: ${query.trim()}. Clarify constraints, then deliver. Do not claim capabilities this model does not have.`;
}

export function advisorSystem(models: ModelRecord[], locale: Locale, copy: Messages, fx: FxQuote): string {
  const brief = catalogBrief(models, locale, copy, fx);
  if (locale === "zh") {
    return `你是万象 Playground 向导。用户来这里是为了找到最适合自己的模型或组合，并会用、用得好。\n只从下面货架推荐，写出 vendor/id。先澄清需求，再给 1–3 个选择，最后给一段可直接用的系统提示词。\n\n货架：\n${brief}`;
  }
  return `You are the Myriad Playground guide. People come here to find the right model or combo, then learn to use it well.\nRecommend only from this catalog, using vendor/id. Clarify the job, pick 1–3 options, then draft a system prompt they can paste.\n\nCatalog:\n${brief}`;
}

export function localAdvice(
  query: string,
  picks: ModelRecord[],
  locale: Locale,
  copy: Messages,
): string {
  const lines = picks.map((model) => `- ${modelKey(model)} · ${modelLabel(model, locale)} · ${vendorLabel(model.vendor, locale)}`);
  const prompt = starterPrompt(query, picks[0], locale);
  return `${copy.play.fallback}\n\n${lines.join("\n")}\n\n${copy.play.promptTitle}\n${prompt}`;
}

export function assistantText(body: unknown): string {
  if (body == null || typeof body !== "object") {
    return JSON.stringify(body, null, 2);
  }
  const output = (body as { output?: { message?: { content?: unknown } } }).output;
  const content = output?.message?.content;
  if (typeof content === "string") {
    return content;
  }
  return JSON.stringify(body, null, 2);
}
