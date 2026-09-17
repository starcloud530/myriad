import { ChannelFailedError } from "../domain/errors.ts";
import type { Env } from "../env.ts";

export function readSecretEnv(env: Env, config: Record<string, unknown> | undefined, channelId: string): string {
  const name = typeof config?.secret_env === "string" ? config.secret_env : "";
  if (!name) {
    throw new ChannelFailedError(channelId, "channel missing secret_env");
  }
  const value = (env as Record<string, string | undefined>)[name];
  if (!value) {
    throw new ChannelFailedError(channelId, `secret ${name} is not set`);
  }
  return value;
}

export function readString(config: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = config?.[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
