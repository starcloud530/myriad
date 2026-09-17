import { ProtocolError } from "../envelope.ts";
import type { ChatInput, ChatMessage } from "./types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMessage(value: unknown): value is ChatMessage {
  if (!isRecord(value)) return false;
  const role = value.role;
  return (
    (role === "system" || role === "user" || role === "assistant" || role === "tool") &&
    (typeof value.content === "string" || Array.isArray(value.content))
  );
}

export function parseChatInput(input: unknown): ChatInput {
  if (!isRecord(input)) {
    throw new ProtocolError(400, "bad_request", "chat input must be an object");
  }
  if (!Array.isArray(input.messages) || input.messages.length === 0) {
    throw new ProtocolError(400, "bad_request", "chat.messages is required");
  }
  if (!input.messages.every(isMessage)) {
    throw new ProtocolError(400, "bad_request", "chat.messages has an invalid item");
  }
  return {
    messages: input.messages,
    tools: Array.isArray(input.tools) ? (input.tools as ChatInput["tools"]) : undefined,
    stream: input.stream === true,
  };
}
