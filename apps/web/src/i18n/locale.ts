export type Locale = "en" | "zh";

const storageKey = "myriad.locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "zh";
}

export function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(storageKey);
    if (isLocale(saved)) {
      return saved;
    }
  } catch {
    /* ignore */
  }
  return "en";
}

export function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(storageKey, locale);
  } catch {
    /* ignore */
  }
}

export function htmlLang(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : "en";
}
