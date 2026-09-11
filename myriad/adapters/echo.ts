import { AdapterKinds } from "../domain/ids.ts";
import type { AdapterRequest, ChannelAdapter } from "./types.ts";

/** 本地接线用。不打真实上游，用来验证鉴权、路由、账本是否通。 */
export class EchoAdapter implements ChannelAdapter {
  readonly kind = AdapterKinds.echo;

  async invoke(request: AdapterRequest): Promise<unknown> {
    return {
      echo: true,
      capability: request.capability.id,
      channel: request.channel.id,
      input: request.input,
    };
  }
}
