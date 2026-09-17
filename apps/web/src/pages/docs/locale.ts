export type DocsLocale = "zh" | "en";

const storageKey = "myriad.docs.locale";

export const docsSlugs = ["quickstart", "api", "sdk", "keys", "errors"] as const;
export type DocsSlug = (typeof docsSlugs)[number];

export function isDocsLocale(value: string | null | undefined): value is DocsLocale {
  return value === "zh" || value === "en";
}

export function isDocsSlug(value: string | undefined): value is DocsSlug {
  return docsSlugs.includes(value as DocsSlug);
}

export function detectLocale(): DocsLocale {
  try {
    const saved = localStorage.getItem(storageKey);
    if (isDocsLocale(saved)) {
      return saved;
    }
  } catch {
    /* ignore */
  }
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh")) {
    return "zh";
  }
  return "en";
}

export function persistLocale(locale: DocsLocale): void {
  try {
    localStorage.setItem(storageKey, locale);
  } catch {
    /* ignore */
  }
}

export function docsHref(locale: DocsLocale, slug: DocsSlug): string {
  return `/docs/${locale}/${slug}`;
}
