import type { ReactNode } from "react";
import { UnwiredHint } from "../../components/biz/UnwiredHint.tsx";

export function OpsPage(): ReactNode {
  return <UnwiredHint title="运维" detail="接入监测还没做。渠道健康会跟货架一起出现，不在这页装空表。" />;
}
