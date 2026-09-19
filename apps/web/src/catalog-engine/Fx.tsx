import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocale } from "../i18n/Locale.tsx";
import { fetchLiveQuote, fallbackQuote, formatRate, initialQuote, type FxQuote } from "./fx.ts";
import { priceSummary } from "./price.ts";
import type { ModelPricing } from "./spec.ts";

const FxContext = createContext<FxQuote>(fallbackQuote());

export function FxProvider({ children }: { children: ReactNode }): ReactNode {
  const [quote, setQuote] = useState<FxQuote>(() => initialQuote());

  useEffect(() => {
    let cancelled = false;
    void fetchLiveQuote()
      .then((live) => {
        if (!cancelled) {
          setQuote(live);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQuote(initialQuote());
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <FxContext.Provider value={quote}>{children}</FxContext.Provider>;
}

export function useFx(): FxQuote {
  return useContext(FxContext);
}

export function usePriceText(): {
  fx: FxQuote;
  summary: (pricing: ModelPricing) => string;
  note: string;
} {
  const { locale, copy } = useLocale();
  const fx = useFx();
  return {
    fx,
    summary: (pricing) => priceSummary(pricing, copy, locale, fx),
    note: copy.detail.fx(formatRate(fx.usdCny), fx.asOf, fx.source === "live"),
  };
}
