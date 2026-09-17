import type { ReactNode } from "react";
import { ComingSoon } from "../../components/biz/ComingSoon.tsx";
import { useLocale } from "../../i18n/Locale.tsx";

export function OpsPage(): ReactNode {
  const { copy } = useLocale();
  return (
    <ComingSoon
      title={copy.soon.opsTitle}
      description={copy.soon.opsIntro}
      points={[copy.soon.ops1, copy.soon.ops2, copy.soon.ops3]}
    />
  );
}
