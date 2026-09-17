import type { MediaRef } from "../media.ts";

export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ChatTextPart {
  type: "text";
  text: string;
}

export interface ChatMediaPart {
  type: "media";
  media: MediaRef;
}

export type ChatContent = string | Array<ChatTextPart | ChatMediaPart>;

export interface ChatMessage {
  role: ChatRole;
  content: ChatContent;
  tool_call_id?: string;
}

export interface ChatTool {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
}

export interface ChatInput {
  messages: ChatMessage[];
  tools?: ChatTool[];
  stream?: boolean;
}

export interface ChatToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ChatOutput {
  message: {
    role: "assistant";
    content: string;
    tool_calls?: ChatToolCall[];
  };
}
