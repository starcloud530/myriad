/** 生产网关。Worker 绑了 myriad.ing / www.myriad.ing，与控制台同域。 */
export const PRODUCTION_ORIGIN = "https://myriad.ing";

export function liveOrigin(): string {
  return window.location.origin.replace(/\/+$/, "");
}

/** 电台地址。频段（能力路径）由调用方自己接。 */
export function publicBaseUrl(): string {
  return `${liveOrigin()}/v1`;
}
