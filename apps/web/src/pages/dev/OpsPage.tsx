import type { ReactNode } from "react";
import { ComingSoon } from "../../components/biz/ComingSoon.tsx";

export function OpsPage(): ReactNode {
  return (
    <ComingSoon
      title="运维"
      description="延迟、错误率与上游状态将集中在这一页。"
      points={["渠道健康", "错误率与延迟", "近期故障"]}
    />
  );
}
