import type { ReactNode } from "react";
import { UnwiredHint } from "../../components/biz/UnwiredHint.tsx";

export function PricingRulesPage(): ReactNode {
  return <UnwiredHint title="计费规则" detail="价格只在货架 yaml 快照里。换算规则未接通。" />;
}
