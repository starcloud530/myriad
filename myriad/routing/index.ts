import { NotFoundError } from "../domain/errors.ts";
import type { Capability, Channel } from "../domain/types.ts";

export function pickChannels(capability: Capability, prefer?: string): Channel[] {
  const enabled = capability.channels.filter((channel) => channel.enabled);
  if (prefer) {
    const hit = enabled.find((channel) => channel.id === prefer);
    if (!hit) {
      throw new NotFoundError(`channel ${prefer} not found`);
    }
    return [hit, ...enabled.filter((channel) => channel.id !== prefer)];
  }

  const primary = enabled.filter((channel) => channel.role === "primary");
  const fallback = enabled.filter((channel) => channel.role === "fallback");
  return [...primary, ...fallback];
}
