import type { Env } from "../env.ts";
import type { AdapterKind } from "../domain/ids.ts";
import type { Capability, Channel, InvokeInput } from "../domain/types.ts";

export interface AdapterRequest {
  capability: Capability;
  channel: Channel;
  input: InvokeInput;
  env: Env;
}

export interface ChannelAdapter {
  readonly kind: AdapterKind;
  invoke(request: AdapterRequest): Promise<unknown>;
}
