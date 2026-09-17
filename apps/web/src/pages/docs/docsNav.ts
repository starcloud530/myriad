export interface DocsLink {
  path: string;
  title: string;
}

export interface DocsGroup {
  title: string;
  items: DocsLink[];
}

export const docsNav: DocsGroup[] = [
  {
    title: "Get started",
    items: [{ path: "/docs/quickstart", title: "Quickstart" }],
  },
  {
    title: "Integrate",
    items: [
      { path: "/docs/api", title: "API" },
      { path: "/docs/sdk", title: "TypeScript SDK" },
    ],
  },
  {
    title: "Platform",
    items: [
      { path: "/docs/keys", title: "API keys" },
      { path: "/docs/errors", title: "Errors" },
    ],
  },
];
