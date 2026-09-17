import { AdapterKinds } from "../domain/ids.ts";
import { ChannelFailedError } from "../domain/errors.ts";
import type { ChatInput, ChatMessage } from "../protocol/chat/types.ts";
import type { AdapterRequest, ChannelAdapter } from "./types.ts";
import { readSecretEnv, readString } from "./secret.ts";

function toOpenAiContent(content: ChatMessage["content"]): unknown {
  if (typeof content === "string") {
    return content;
  }
  return content.map((part) => {
    if (part.type === "text") {
      return { type: "text", text: part.text };
    }
    return { type: "image_url", image_url: { url: part.media.uri } };
  });
}

export class OpenAiCompatAdapter implements ChannelAdapter {
  readonly kind = AdapterKinds.openaiCompat;

  async invoke(request: AdapterRequest): Promise<unknown> {
    const input = request.input as unknown as ChatInput;
    const baseUrl = (readString(request.channel.config, "base_url") ?? "").replace(/\/$/, "");
    const model = readString(request.channel.config, "vendor_model");
    if (!baseUrl || !model) {
      throw new ChannelFailedError(request.channel.id, "openai_compat missing base_url or vendor_model");
    }
    const apiKey = readSecretEnv(request.env, request.channel.config, request.channel.id);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: input.messages.map((message) => ({
          role: message.role,
          content: toOpenAiContent(message.content),
          tool_call_id: message.tool_call_id,
        })),
        tools: input.tools?.map((tool) => ({
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        })),
      }),
    });

    const body = (await response.json()) as {
      error?: { message?: string };
      choices?: Array<{
        message?: { content?: string; tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }> };
      }>;
    };

    if (!response.ok) {
      throw new ChannelFailedError(request.channel.id, body.error?.message ?? `upstream ${response.status}`);
    }

    const message = body.choices?.[0]?.message;
    return {
      message: {
        role: "assistant",
        content: message?.content ?? "",
        tool_calls: message?.tool_calls?.map((call) => {
          try {
            return {
              id: call.id,
              name: call.function.name,
              arguments: JSON.parse(call.function.arguments || "{}") as Record<string, unknown>,
            };
          } catch {
            return { id: call.id, name: call.function.name, arguments: {} };
          }
        }),
      },
    };
  }
}
