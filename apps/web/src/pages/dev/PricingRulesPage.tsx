import type { ReactNode } from "react";
import { ComingSoon } from "../../components/biz/ComingSoon.tsx";
import { useLocale } from "../../i18n/Locale.tsx";

export function PricingRulesPage(): ReactNode {
  const { copy } = useLocale();
  return (
    <ComingSoon
      title={copy.soon.pricingTitle}
      description={copy.soon.pricingIntro}
      points={[copy.soon.pricing1, copy.soon.pricing2, copy.soon.pricing3]}
    />
  );
}
