import { createContext, useContext, useEffect, type ReactNode } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { useLocale } from "../../i18n/Locale.tsx";
import {
  detectLocale,
  docsHref,
  isDocsLocale,
  isDocsSlug,
  persistLocale,
  type DocsLocale,
} from "./locale.ts";

const LocaleContext = createContext<DocsLocale>("en");

export function useDocsLocale(): DocsLocale {
  return useContext(LocaleContext);
}

export function DocsLocaleGate({ children }: { children: ReactNode }): ReactNode {
  const { lang } = useParams();
  if (!isDocsLocale(lang)) {
    return <Navigate to={docsHref(detectLocale(), "quickstart")} replace />;
  }
  return <DocsLocaleSync locale={lang}>{children}</DocsLocaleSync>;
}

function DocsLocaleSync({ locale, children }: { locale: DocsLocale; children: ReactNode }): ReactNode {
  const { setLocale } = useLocale();
  useEffect(() => {
    persistLocale(locale);
    setLocale(locale);
  }, [locale, setLocale]);
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function DocsLegacyRedirect({ slug }: { slug: "quickstart" | "api" | "sdk" | "keys" | "errors" }): ReactNode {
  return <Navigate to={docsHref("en", slug)} replace />;
}

export function DocsIndexRedirect(): ReactNode {
  return <Navigate to={docsHref(detectLocale(), "quickstart")} replace />;
}

export function useSwitchDocsLocale(): (next: DocsLocale) => void {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLocale } = useLocale();
  return (next: DocsLocale) => {
    setLocale(next);
    persistLocale(next);
    const parts = location.pathname.split("/").filter(Boolean);
    const slug = isDocsSlug(parts[2]) ? parts[2] : "quickstart";
    void navigate(docsHref(next, slug));
  };
}
