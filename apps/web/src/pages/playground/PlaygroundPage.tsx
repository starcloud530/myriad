import type { ReactNode } from "react";
import { ModelShelf } from "../../catalog-engine/index.ts";

export function PlaygroundPage(): ReactNode {
  return (
    <ModelShelf
      eyebrow="试用"
      title="在线试跑"
      intro="选一个模型，用你的密钥立刻调用。价格与可用性写在卡片上。"
    />
  );
}
