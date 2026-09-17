import type { ReactNode } from "react";
import { ModelShelf } from "../../catalog-engine/index.ts";
import { useLocale } from "../../i18n/Locale.tsx";

export function PlaygroundPage(): ReactNode {
  const { copy } = useLocale();
  return <ModelShelf eyebrow={copy.play.eyebrow} title={copy.play.title} intro={copy.play.intro} />;
}
