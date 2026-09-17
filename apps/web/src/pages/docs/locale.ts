import { detectLocale as detectUiLocale, persistLocale as persistUiLocale, isLocale, type Locale } from "../../i18n/locale.ts";

export type DocsLocale = Locale;

export const docsSlugs = ["quickstart", "api", "sdk", "keys", "errors"] as const;
export type DocsSlug = (typeof docsSlugs)[number];

export function isDocsLocale(value: string | null | undefined): value is DocsLocale {
  return isLocale(value);
}

export function isDocsSlug(value: string | undefined): value is DocsSlug {
  return docsSlugs.includes(value as DocsSlug);
}

export function detectLocale(): DocsLocale {
  return detectUiLocale();
}

export function persistLocale(locale: DocsLocale): void {
  persistUiLocale(locale);
}

export function docsHref(locale: DocsLocale, slug: DocsSlug): string {
  return `/docs/${locale}/${slug}`;
}
