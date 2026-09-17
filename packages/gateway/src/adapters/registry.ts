import { ChannelFailedError } from "../domain/errors.ts";
import type { AdapterKind } from "../domain/ids.ts";
import type { ChannelAdapter } from "./types.ts";

export class AdapterRegistry {
  private readonly adapters = new Map<AdapterKind, ChannelAdapter>();

  register(adapter: ChannelAdapter): this {
    this.adapters.set(adapter.kind, adapter);
    return this;
  }

  resolve(kind: AdapterKind, channelId: string): ChannelAdapter {
    const adapter = this.adapters.get(kind);
    if (!adapter) {
      throw new ChannelFailedError(channelId, `adapter ${kind} is not registered`);
    }
    return adapter;
  }
}
