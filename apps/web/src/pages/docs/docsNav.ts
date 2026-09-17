import { docsHref, type DocsLocale, type DocsSlug } from "./locale.ts";

export interface DocsLink {
  slug: DocsSlug;
  path: string;
  title: string;
}

export interface DocsGroup {
  title: string;
  items: DocsLink[];
}

const labels: Record<DocsLocale, { groups: [string, string, string]; items: Record<DocsSlug, string> }> = {
  zh: {
    groups: ["开始", "接入", "平台"],
    items: {
      quickstart: "快速开始",
      api: "API",
      sdk: "TypeScript SDK",
      keys: "密钥",
      errors: "错误码",
    },
  },
  en: {
    groups: ["Get started", "Integrate", "Platform"],
    items: {
      quickstart: "Quickstart",
      api: "API",
      sdk: "TypeScript SDK",
      keys: "API keys",
      errors: "Errors",
    },
  },
};

export function docsNav(locale: DocsLocale): DocsGroup[] {
  const pack = labels[locale];
  const item = (slug: DocsSlug): DocsLink => ({
    slug,
    path: docsHref(locale, slug),
    title: pack.items[slug],
  });
  return [
    { title: pack.groups[0], items: [item("quickstart")] },
    { title: pack.groups[1], items: [item("api"), item("sdk")] },
    { title: pack.groups[2], items: [item("keys"), item("errors")] },
  ];
}
