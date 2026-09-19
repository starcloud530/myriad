/** 生产网关。Worker 绑了 myriad.ing / www.myriad.ing，与控制台同域。 */
export const PRODUCTION_ORIGIN = "https://myriad.ing";

export function liveOrigin(): string {
  return window.location.origin.replace(/\/+$/, "");
}

export function isLocalOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}
