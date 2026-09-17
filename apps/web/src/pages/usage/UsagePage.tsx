import type { ReactNode } from "react";
import { ComingSoon } from "../../components/biz/ComingSoon.tsx";
import { useLocale } from "../../i18n/Locale.tsx";

export function UsagePage(): ReactNode {
  const { copy } = useLocale();
  return (
    <ComingSoon
      title={copy.soon.usageTitle}
      description={copy.soon.usageIntro}
      points={[copy.soon.usage1, copy.soon.usage2, copy.soon.usage3]}
    />
  );
}
