import type { ReactNode } from "react";
import { ComingSoon } from "../../components/biz/ComingSoon.tsx";

export function ChannelsPage(): ReactNode {
  return (
    <ComingSoon
      title="渠道"
      description="主备路由与厂商接入将在控制台配置，应用始终只打一条能力路径。"
      points={["查看主渠道与回落", "开关某条出站线路", "查看健康状态"]}
    />
  );
}
