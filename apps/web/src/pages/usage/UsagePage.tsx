import type { ReactNode } from "react";
import { ComingSoon } from "../../components/biz/ComingSoon.tsx";

export function UsagePage(): ReactNode {
  return (
    <ComingSoon
      title="用量"
      description="请求次数、费用与延迟会按密钥和能力汇总，方便对账与排障。"
      points={["按密钥、能力、时间范围筛选", "导出调用明细", "异常调用告警"]}
    />
  );
}
