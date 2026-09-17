export interface VendorMeta {
  id: string;
  name: string;
  mark: string;
  bg: string;
  fg: string;
}

const vendors: Record<string, VendorMeta> = {
  myriad: { id: "myriad", name: "万象", mark: "万", bg: "#161412", fg: "#f5efe6" },
  deepseek: { id: "deepseek", name: "DeepSeek", mark: "DS", bg: "#4D6BFE", fg: "#ffffff" },
  qianwen: { id: "qianwen", name: "通义千问", mark: "千", bg: "#615CED", fg: "#ffffff" },
  fal: { id: "fal", name: "fal", mark: "fa", bg: "#111111", fg: "#ffffff" },
  volcengine: { id: "volcengine", name: "火山方舟", mark: "火", bg: "#FF5A1F", fg: "#ffffff" },
};

export const vendorOrder = ["myriad", "deepseek", "qianwen", "fal", "volcengine"] as const;

export function vendorMeta(vendor: string): VendorMeta {
  return (
    vendors[vendor] ?? {
      id: vendor,
      name: vendor,
      mark: vendor.slice(0, 2).toUpperCase(),
      bg: "#8c8c8c",
      fg: "#ffffff",
    }
  );
}

export function groupByVendor<T extends { vendor: string }>(items: T[]): Array<{ vendor: string; items: T[] }> {
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const list = buckets.get(item.vendor) ?? [];
    list.push(item);
    buckets.set(item.vendor, list);
  }
  const rank = new Map<string, number>(vendorOrder.map((vendor, index) => [vendor, index]));
  const known = vendorOrder.filter((vendor) => buckets.has(vendor));
  const rest = [...buckets.keys()].filter((vendor) => !rank.has(vendor)).sort();
  return [...known, ...rest].map((vendor) => ({ vendor, items: buckets.get(vendor) ?? [] }));
}
