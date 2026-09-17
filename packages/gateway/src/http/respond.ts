import { MyriadError } from "../domain/errors.ts";
import { ProtocolError } from "../protocol/envelope.ts";

export function json(data: unknown, status = 200, requestId?: string): Response {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
  });
  if (requestId) {
    headers.set("x-request-id", requestId);
  }
  return new Response(JSON.stringify(data), { status, headers });
}

export function respondError(err: unknown, requestId: string): Response {
  if (err instanceof MyriadError || err instanceof ProtocolError) {
    return json(
      { error: { code: err.code, message: err.message }, request_id: requestId },
      err.status,
      requestId,
    );
  }

  console.error("myriad.unhandled", requestId, err);
  return json(
    { error: { code: "internal_error", message: "internal error" }, request_id: requestId },
    500,
    requestId,
  );
}
