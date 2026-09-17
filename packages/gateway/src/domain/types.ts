import type { ProtocolKind } from "../protocol/kind.ts";
import type { AdapterKind } from "./ids.ts";

export type Modality = "image" | "text" | "multimodal" | "audio" | "video";
export type InvokeMode = "sync" | "async";
export type BillingUnit = "image" | "request" | "token" | "audio_second" | "video_second";
export type ChannelRole = "primary" | "fallback";

export interface BillingSpec {
  unit: BillingUnit;
  /** 可选人民币单价快照，不是每次请求写库。 */
  cny_per_unit?: number;
}

export interface Channel {
  id: string;
  adapter: AdapterKind;
  role: ChannelRole;
  enabled: boolean;
  /** 对外厂商：万象自建为 myriad。适配器是 echo/http，厂商不是 echo。 */
  vendor?: string;
  /** 只放 secret_env / vendor_model / base_url。对外列表必须剥掉。 */
  config?: Record<string, unknown>;
}

export interface Capability {
  id: string;
  name: string;
  kind: ProtocolKind;
  modality: Modality;
  mode: InvokeMode;
  billing: BillingSpec;
  enabled: boolean;
  channels: Channel[];
  /** 对外介绍，不是密钥。 */
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  apiKeys: string[];
  capabilities: string[];
}

export interface InvokeInput {
  [key: string]: unknown;
}

export interface Usage {
  units: number;
  unit: BillingUnit;
}

export interface InvokeSuccess {
  request_id: string;
  capability: string;
  kind: ProtocolKind;
  channel: string;
  output: unknown;
  usage: Usage;
}

export interface PublicChannel {
  id: string;
  adapter: AdapterKind;
  role: ChannelRole;
  enabled: boolean;
  vendor: string;
  vendor_model?: string;
}

export interface PublicCapability {
  id: string;
  name: string;
  kind: ProtocolKind;
  modality: Modality;
  mode: InvokeMode;
  billing: BillingSpec;
  enabled: boolean;
  channels: PublicChannel[];
  description?: string;
}

function vendorOf(channel: Channel): string {
  if (channel.vendor) {
    return channel.vendor;
  }
  const fromConfig = channel.config?.vendor;
  if (typeof fromConfig === "string" && fromConfig.length > 0) {
    return fromConfig;
  }
  if (channel.adapter === "fal") return "fal";
  if (channel.adapter === "volcengine") return "volcengine";
  if (channel.adapter === "echo") return "myriad";
  if (channel.id === "deepseek" || channel.id.startsWith("deepseek")) return "deepseek";
  if (channel.id === "qianwen" || channel.id.startsWith("qianwen")) return "qianwen";
  return channel.adapter;
}

function vendorModelOf(channel: Channel): string | undefined {
  const value = channel.config?.vendor_model;
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function toPublicCapability(capability: Capability): PublicCapability {
  return {
    id: capability.id,
    name: capability.name,
    kind: capability.kind,
    modality: capability.modality,
    mode: capability.mode,
    billing: capability.billing,
    enabled: capability.enabled,
    description: capability.description,
    channels: capability.channels.map((channel) => ({
      id: channel.id,
      adapter: channel.adapter,
      role: channel.role,
      enabled: channel.enabled,
      vendor: vendorOf(channel),
      vendor_model: vendorModelOf(channel),
    })),
  };
}
