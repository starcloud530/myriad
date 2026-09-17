import type { ReactNode } from "react";
import { ComingSoon } from "../../components/biz/ComingSoon.tsx";
import { useLocale } from "../../i18n/Locale.tsx";

export function ChannelsPage(): ReactNode {
  const { copy } = useLocale();
  return (
    <ComingSoon
      title={copy.soon.channelsTitle}
      description={copy.soon.channelsIntro}
      points={[copy.soon.channels1, copy.soon.channels2, copy.soon.channels3]}
    />
  );
}
