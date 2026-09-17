import type { PublicCapability } from "../features/capability/types.ts";
import type { Messages } from "../i18n/messages.ts";
import type { ModelRecord } from "./spec.ts";
import { vendorMeta } from "./vendors.ts";

export type ShelfStatus = "live" | "down" | "unwired";

export interface ShelfHealth {
  status: ShelfStatus;
  label: string;
  channels: string;
}

export function contextLabel(model: ModelRecord, copy: Messages): string | undefined {
  const length = model.specs?.context_length;
  if (length == null) {
    return undefined;
  }
  if (length >= 1_000_000) {
    return `${length / 1_000_000}M ${copy.labels.context}`;
  }
  if (length >= 1000) {
    return `${Math.round(length / 1000)}K ${copy.labels.context}`;
  }
  return `${length} ${copy.labels.context}`;
}

export function unitLabel(model: ModelRecord, copy: Messages): string {
  if (model.pricing.unit === "token") {
    return copy.labels.token;
  }
  if (model.pricing.unit === "image") {
    return copy.labels.imageUnit;
  }
  if (model.pricing.unit === "audio_second") {
    return copy.labels.audioSec;
  }
  if (model.pricing.unit === "video_second") {
    return copy.labels.videoSec;
  }
  return copy.labels.request;
}

function vendorNames(ids: string[]): string {
  return ids.map((id) => vendorMeta(id).name).join(" · ");
}

export function shelfHealth(
  model: ModelRecord,
  copy: Messages,
  capability?: PublicCapability | null,
): ShelfHealth {
  if (!capability) {
    return { status: "unwired", label: copy.labels.offline, channels: copy.labels.unavailable };
  }
  if (!capability.enabled || !model.enabled) {
    return { status: "down", label: copy.labels.disabled, channels: vendorNames(capability.channels.map((row) => row.vendor)) };
  }
  const live = capability.channels.filter((row) => row.enabled);
  if (live.length === 0) {
    return { status: "down", label: copy.labels.unavailable, channels: "" };
  }
  const primary = live.find((row) => row.role === "primary") ?? live[0];
  const fallback = live.filter((row) => row.role === "fallback");
  return {
    status: "live",
    label: copy.labels.live,
    channels: fallback.length
      ? `${vendorMeta(primary.vendor).name} · ${fallback.map((row) => vendorMeta(row.vendor).name).join(" / ")}`
      : vendorMeta(primary.vendor).name,
  };
}
