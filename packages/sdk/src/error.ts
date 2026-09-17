import type { MyriadErrorBody } from "./types.ts";

/** 网关返回的业务错误。`status` 是 HTTP 状态，`code` 是信封里的错误码。 */
export class MyriadClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    const parsed = readError(body);
    super(parsed.message);
    this.name = "MyriadClientError";
    this.status = status;
    this.code = parsed.code;
    this.requestId = parsed.requestId;
    this.body = body;
  }
}

function readError(body: unknown): { code: string; message: string; requestId?: string } {
  if (body != null && typeof body === "object" && "error" in body) {
    const envelope = body as MyriadErrorBody;
    return {
      code: envelope.error?.code ?? "unknown",
      message: envelope.error?.message ?? "request failed",
      requestId: envelope.request_id,
    };
  }
  return { code: "unknown", message: "request failed" };
}
