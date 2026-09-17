import type { ReactNode } from "react";
import { ModelShelf } from "../../catalog-engine/index.ts";

export function HomePage(): ReactNode {
  return <ModelShelf title="万象" intro="下游只对接万象。货架就是产品。" />;
}
