import type { ReactNode } from "react";
import { UnwiredHint } from "../../components/biz/UnwiredHint.tsx";

export function UsagePage(): ReactNode {
  return (
    <UnwiredHint
      title="用量分析"
      detail="账本还没接通。数字全 0 是演戏，所以这一页先标未接通，不装已经在计量。"
    />
  );
}
