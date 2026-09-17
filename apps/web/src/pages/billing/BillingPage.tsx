import type { ReactNode } from "react";
import { ComingSoon } from "../../components/biz/ComingSoon.tsx";

export function BillingPage(): ReactNode {
  return (
    <ComingSoon
      title="账单"
      description="月度账单、发票与支付方式将在这里管理。"
      points={["按账期查看消费", "下载发票", "设置余额与额度"]}
    />
  );
}
