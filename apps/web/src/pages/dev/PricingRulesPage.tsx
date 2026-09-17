import type { ReactNode } from "react";
import { ComingSoon } from "../../components/biz/ComingSoon.tsx";

export function PricingRulesPage(): ReactNode {
  return (
    <ComingSoon
      title="计费"
      description="标价、加价与结算币种将在这里维护。"
      points={["按能力查看单价", "设置加价", "同步公开价目"]}
    />
  );
}
