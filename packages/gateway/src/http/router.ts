import type { Env } from "../env.ts";
import { NotFoundError } from "../domain/errors.ts";

export type RouteHandler = (
  request: Request,
  params: Record<string, string>,
  env: Env,
) => Promise<Response>;

interface Route {
  method: string;
  keys: string[];
  pattern: RegExp;
  handler: RouteHandler;
}

function compile(path: string): { keys: string[]; pattern: RegExp } {
  const keys: string[] = [];
  const source = path.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, (_, key: string) => {
    keys.push(key);
    return "([^/]+)";
  });
  return { keys, pattern: new RegExp(`^${source}$`) };
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export class Router {
  private readonly routes: Route[] = [];

  on(method: string, path: string, handler: RouteHandler): this {
    const { keys, pattern } = compile(path);
    this.routes.push({ method: method.toUpperCase(), keys, pattern, handler });
    return this;
  }

  async handle(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = normalizePath(url.pathname);

    for (const route of this.routes) {
      if (route.method !== request.method) {
        continue;
      }
      const match = path.match(route.pattern);
      if (!match) {
        continue;
      }
      const params: Record<string, string> = {};
      route.keys.forEach((key, index) => {
        params[key] = decodeURIComponent(match[index + 1] ?? "");
      });
      return route.handler(request, params, env);
    }

    throw new NotFoundError("not found");
  }
}
