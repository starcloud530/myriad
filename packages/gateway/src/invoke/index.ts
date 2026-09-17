import type { AdapterRegistry } from "../adapters/registry.ts";
import type { Authenticator } from "../auth/index.ts";
import type { Catalog } from "../catalog/types.ts";
import {
  AllChannelsFailedError,
  BadRequestError,
  CapabilityDisabledError,
  ForbiddenError,
  NotFoundError,
} from "../domain/errors.ts";
import type { InvokeInput, InvokeSuccess } from "../domain/types.ts";
import type { Env } from "../env.ts";
import type { Ledger } from "../ledger/index.ts";
import type { QuotaGuard } from "../quota/index.ts";
import { parseInput, ProtocolError } from "../protocol/index.ts";
import { pickChannels } from "../routing/index.ts";

export interface InvokeDeps {
  catalog: Catalog;
  auth: Authenticator;
  quota: QuotaGuard;
  ledger: Ledger;
  adapters: AdapterRegistry;
  env: Env;
}

export interface InvokeCommand {
  request: Request;
  requestId: string;
  capabilityId: string;
  input: InvokeInput;
  channel?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseInvokeBody(body: unknown): { input: InvokeInput; channel?: string } {
  if (!isRecord(body)) {
    throw new BadRequestError("body must be an object");
  }
  if ("input" in body) {
    if (!isRecord(body.input)) {
      throw new BadRequestError("input must be an object");
    }
    return {
      input: body.input,
      channel: typeof body.channel === "string" ? body.channel : undefined,
    };
  }
  return {
    input: body,
    channel: typeof body.channel === "string" ? body.channel : undefined,
  };
}

function parsedInput(kind: InvokeSuccess["kind"], input: InvokeInput): InvokeInput {
  try {
    return parseInput(kind, input) as InvokeInput;
  } catch (error) {
    if (error instanceof ProtocolError) {
      throw new BadRequestError(error.message);
    }
    throw error;
  }
}

export async function invokeCapability(deps: InvokeDeps, command: InvokeCommand): Promise<InvokeSuccess> {
  const product = await deps.auth.requireProduct(command.request);
  const capability = await deps.catalog.getCapability(command.capabilityId);
  if (!capability) {
    throw new NotFoundError(`capability ${command.capabilityId} not found`);
  }
  if (!capability.enabled) {
    throw new CapabilityDisabledError(capability.id);
  }
  if (!product.capabilities.includes(capability.id)) {
    throw new ForbiddenError(`product ${product.id} cannot use ${capability.id}`);
  }

  const input = parsedInput(capability.kind, command.input);
  await deps.quota.assertWithin(product, capability);

  const channels = pickChannels(capability, command.channel);
  if (channels.length === 0) {
    throw new AllChannelsFailedError(capability.id, "no enabled channel");
  }

  let lastMessage = "no channel attempted";
  for (const channel of channels) {
    const started = Date.now();
    try {
      const adapter = deps.adapters.resolve(channel.adapter, channel.id);
      const output = await adapter.invoke({
        capability,
        channel,
        input,
        env: deps.env,
      });
      await deps.ledger.record({
        requestId: command.requestId,
        productId: product.id,
        capabilityId: capability.id,
        channelId: channel.id,
        ok: true,
        durationMs: Date.now() - started,
        units: 1,
      });
      return {
        request_id: command.requestId,
        capability: capability.id,
        kind: capability.kind,
        channel: channel.id,
        output,
        usage: { units: 1, unit: capability.billing.unit },
      };
    } catch (error) {
      lastMessage = error instanceof Error ? error.message : "channel failed";
      await deps.ledger.record({
        requestId: command.requestId,
        productId: product.id,
        capabilityId: capability.id,
        channelId: channel.id,
        ok: false,
        durationMs: Date.now() - started,
        units: 0,
        error: lastMessage,
      });
    }
  }

  throw new AllChannelsFailedError(capability.id, lastMessage);
}
