import type { PublicCapability } from "../features/capability/types.ts";
import type { ModelRecord } from "./spec.ts";

export type ShelfStatus = "live" | "down" | "unwired";

export interface ShelfHealth {
  status: ShelfStatus;
  label: string;
  channels: string;
}

export function contextLabel(model: ModelRecord): string | undefined {
  const length = model.specs?.context_length;
  if (length == null) {
    return undefined;
  }
  if (length >= 1_000_000) {
    return `${length / 1_000_000}M 上下文`;
  }
  if (length >= 1000) {
    return `${Math.round(length / 1000)}K 上下文`;
  }
  return `${length} 上下文`;
}

export function unitLabel(model: ModelRecord): string {
  if (model.pricing.unit === "token") {
    return "token";
  }
  if (model.pricing.unit === "image") {
    return "张";
  }
  if (model.pricing.unit === "audio_second") {
    return "音频秒";
  }
  if (model.pricing.unit === "video_second") {
    return "视频秒";
  }
  return "次";
}

export function shelfHealth(model: ModelRecord, capability?: PublicCapability | null): ShelfHealth {
  if (!capability) {
    return { status: "unwired", label: "未接通", channels: "网关未登记该能力" };
  }
  if (!capability.enabled || !model.enabled) {
    return { status: "down", label: "停用", channels: capability.channels.map((row) => row.vendor).join(" · ") };
  }
  const live = capability.channels.filter((row) => row.enabled);
  if (live.length === 0) {
    return { status: "down", label: "无渠道", channels: "" };
  }
  const primary = live.find((row) => row.role === "primary") ?? live[0];
  const fallback = live.filter((row) => row.role === "fallback");
  return {
    status: "live",
    label: "可用",
    channels: fallback.length
      ? `${primary.vendor} 主 · ${fallback.map((row) => row.vendor).join("/")} 兜底`
      : `${primary.vendor} 主渠道`,
  };
}
