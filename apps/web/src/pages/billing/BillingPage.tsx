import type { ReactNode } from "react";
import { UnwiredHint } from "../../components/biz/UnwiredHint.tsx";

export function BillingPage(): ReactNode {
  return (
    <UnwiredHint
      title="账单"
      detail="结算未接通。没有余额、没有账期。顶栏那枚徽章只说明当前是开发环境。"
    />
  );
}
