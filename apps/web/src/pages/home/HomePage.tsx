import type { ReactNode } from "react";
import { ModelShelf } from "../../catalog-engine/index.ts";

export function HomePage(): ReactNode {
  return (
    <ModelShelf
      eyebrow="产品"
      title="模型"
      intro="对话、图像、视频与语音。一把密钥，按能力调用。"
    />
  );
}
