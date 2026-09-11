import { createDefaultApp } from "./app.ts";
import type { Env } from "./env.ts";
import { respondError } from "./http/respond.ts";

function requestIdOf(request: Request): string {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestId = requestIdOf(request);
    try {
      const response = await createDefaultApp(env).handle(request, env);
      const headers = new Headers(response.headers);
      headers.set("x-request-id", requestId);
      return new Response(response.body, { status: response.status, headers });
    } catch (error) {
      return respondError(error, requestId);
    }
  },
} satisfies ExportedHandler<Env>;
