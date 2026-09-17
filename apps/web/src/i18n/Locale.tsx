import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { detectLocale, htmlLang, persistLocale, type Locale } from "./locale.ts";
import { t, type Messages } from "./messages.ts";

interface LocaleState {
  locale: Locale;
  copy: Messages;
  setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleState>({
  locale: "en",
  copy: t("en"),
  setLocale: () => undefined,
});

export function LocaleProvider({ children }: { children: ReactNode }): ReactNode {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale());
  const setLocale = useCallback((next: Locale) => {
    persistLocale(next);
    setLocaleState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = htmlLang(locale);
  }, [locale]);

  const value = useMemo(() => ({ locale, copy: t(locale), setLocale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleState {
  return useContext(LocaleContext);
}
