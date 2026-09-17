import type { ReactNode } from "react";
import { ModelShelf } from "../../catalog-engine/index.ts";
import { useLocale } from "../../i18n/Locale.tsx";

export function HomePage(): ReactNode {
  const { copy } = useLocale();
  return <ModelShelf eyebrow={copy.home.eyebrow} title={copy.home.title} intro={copy.home.intro} />;
}
