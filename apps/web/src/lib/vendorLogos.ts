const base = (import.meta.env.VITE_VENDOR_LOGO_BASE ?? "").replace(/\/+$/, "");

/** `{base}/assets/vendors/{id}/logo.svg`，base 未配则没有远程标。 */
export function vendorLogoUrl(vendor: string): string | undefined {
  if (!base || !vendor) {
    return undefined;
  }
  return `${base}/assets/vendors/${encodeURIComponent(vendor)}/logo.svg`;
}
