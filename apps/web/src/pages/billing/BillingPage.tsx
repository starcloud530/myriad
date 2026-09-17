import type { ReactNode } from "react";
import { ComingSoon } from "../../components/biz/ComingSoon.tsx";
import { useLocale } from "../../i18n/Locale.tsx";

export function BillingPage(): ReactNode {
  const { copy } = useLocale();
  return (
    <ComingSoon
      title={copy.soon.billingTitle}
      description={copy.soon.billingIntro}
      points={[copy.soon.billing1, copy.soon.billing2, copy.soon.billing3]}
    />
  );
}
