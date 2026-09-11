import { AdapterKinds, CapabilityIds } from "../domain/ids.ts";
import type { Capability, Product } from "../domain/types.ts";

export interface CatalogSeed {
  capabilities: Capability[];
  products: Product[];
}

/** 开发种子：三条示例能力都先走 echo，接真渠道时只改 channels。 */
export function defaultSeed(): CatalogSeed {
  const echoPrimary = {
    id: "echo",
    adapter: AdapterKinds.echo,
    role: "primary" as const,
    enabled: true,
  };

  return {
    capabilities: [
      {
        id: CapabilityIds.imageNsfw,
        name: "图像敏感内容检测",
        modality: "image",
        mode: "sync",
        billing: { unit: "image" },
        enabled: true,
        channels: [echoPrimary],
      },
      {
        id: CapabilityIds.portraitQuality,
        name: "人像图片质量打分",
        modality: "image",
        mode: "sync",
        billing: { unit: "image" },
        enabled: true,
        channels: [echoPrimary],
      },
      {
        id: CapabilityIds.calorieRecognize,
        name: "卡路里识别",
        modality: "image",
        mode: "sync",
        billing: { unit: "image" },
        enabled: true,
        channels: [echoPrimary],
      },
    ],
    products: [
      {
        id: "dev",
        name: "开发调试",
        apiKeys: ["dev-key"],
        capabilities: [
          CapabilityIds.imageNsfw,
          CapabilityIds.portraitQuality,
          CapabilityIds.calorieRecognize,
        ],
      },
    ],
  };
}
