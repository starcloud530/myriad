import type { ProtocolKind } from "./kind.ts";

export type InvokeMode = "sync" | "stream" | "job";

export interface Usage {
  units: number;
  unit: "token" | "request" | "image" | "audio_second" | "video_second";
}

export interface ProtocolErrorBody {
  code: string;
  message: string;
}

export class ProtocolError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ProtocolError";
    this.status = status;
    this.code = code;
  }
}

/** 北向外壳。所有 kind 共用，input 在各自合同里收窄。 */
export interface InvokeRequest<TInput = unknown> {
  input: TInput;
  /** 调试用，生产路由不认这个。 */
  channel?: string;
}

export interface InvokeSuccess<TOutput = unknown> {
  request_id: string;
  capability: string;
  kind: ProtocolKind;
  channel: string;
  output: TOutput;
  usage: Usage;
}

/** 视频等异步：先回 job，再查。 */
export interface JobRef {
  job_id: string;
  status: "queued" | "running" | "succeeded" | "failed";
  output?: unknown;
  error?: ProtocolErrorBody;
}
