import type { AdapterKind } from "./ids.ts";

export type Modality = "image" | "text" | "multimodal";
export type InvokeMode = "sync" | "async";
export type BillingUnit = "image" | "request" | "token";
export type ChannelRole = "primary" | "fallback";

export interface BillingSpec {
  unit: BillingUnit;
}

export interface Channel {
  id: string;
  adapter: AdapterKind;
  role: ChannelRole;
  enabled: boolean;
  /** 适配器私有配置。对外列表必须剥掉，避免把密钥带出去。 */
  config?: Record<string, unknown>;
}

export interface Capability {
  id: string;
  name: string;
  modality: Modality;
  mode: InvokeMode;
  billing: BillingSpec;
  enabled: boolean;
  channels: Channel[];
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
  channel: string;
  output: unknown;
  usage: Usage;
}

export interface PublicChannel {
  id: string;
  adapter: AdapterKind;
  role: ChannelRole;
  enabled: boolean;
}

export interface PublicCapability {
  id: string;
  name: string;
  modality: Modality;
  mode: InvokeMode;
  billing: BillingSpec;
  enabled: boolean;
  channels: PublicChannel[];
}

export function toPublicCapability(capability: Capability): PublicCapability {
  return {
    id: capability.id,
    name: capability.name,
    modality: capability.modality,
    mode: capability.mode,
    billing: capability.billing,
    enabled: capability.enabled,
    channels: capability.channels.map(({ id, adapter, role, enabled }) => ({
      id,
      adapter,
      role,
      enabled,
    })),
  };
}
