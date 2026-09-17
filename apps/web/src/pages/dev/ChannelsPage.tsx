import type { ReactNode } from "react";
import { UnwiredHint } from "../../components/biz/UnwiredHint.tsx";

export function ChannelsPage(): ReactNode {
  return <UnwiredHint title="渠道管理" detail="渠道配置还在 seed 里，没有控制台。未接通，不装能改的表。" />;
}
