import type { ReactNode } from "react";
import { ModelShelf } from "../../catalog-engine/index.ts";

export function PlaygroundPage(): ReactNode {
  return <ModelShelf title="模型广场" intro="价格、单位、同步/异步、上下文和渠道健康都在卡上。试用打的是北向能力。" />;
}
