import type { CSSProperties, ReactNode } from "react";
import { useEffect } from "react";
import { Link } from "react-router";
import { accentColor, borderColor, textPrimary, textSecondary } from "../../tokens/theme.ts";
import { useDocsLocale } from "./DocsLocale.tsx";
import { docsNav } from "./docsNav.ts";
import { docsHref, type DocsSlug } from "./locale.ts";

const h1: CSSProperties = {
  margin: "0 0 12px",
  fontSize: 36,
  lineHeight: 1.2,
  fontWeight: 650,
  color: textPrimary,
};

const lead: CSSProperties = {
  margin: "0 0 28px",
  fontSize: 17,
  lineHeight: 1.65,
  color: textSecondary,
};

const h2: CSSProperties = {
  margin: "40px 0 12px",
  fontSize: 22,
  fontWeight: 650,
  color: textPrimary,
};

const p: CSSProperties = {
  margin: "0 0 14px",
  fontSize: 15,
  lineHeight: 1.7,
  color: textPrimary,
};

export function DocsH1({ children }: { children: ReactNode }): ReactNode {
  const locale = useDocsLocale();
  const title = typeof children === "string" ? children : "Docs";
  useEffect(() => {
    document.title = locale === "zh" ? `${title} · 万象` : `${title} · Myriad`;
  }, [locale, title]);
  return <h1 style={h1}>{children}</h1>;
}

export function DocsLead({ children }: { children: ReactNode }): ReactNode {
  return <p style={lead}>{children}</p>;
}

export function DocsH2({ children }: { children: ReactNode }): ReactNode {
  return <h2 style={h2}>{children}</h2>;
}

export function DocsP({ children }: { children: ReactNode }): ReactNode {
  return <p style={p}>{children}</p>;
}

export function DocsCallout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <aside
      style={{
        margin: "20px 0 28px",
        padding: "12px 16px",
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 8,
        background: "rgba(255, 77, 58, 0.08)",
        fontSize: 14,
        lineHeight: 1.65,
        color: textPrimary,
      }}
    >
      {title ? (
        <div style={{ fontWeight: 650, marginBottom: 4, color: accentColor }}>{title}</div>
      ) : null}
      {children}
    </aside>
  );
}

export function DocsTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}): ReactNode {
  return (
    <div style={{ overflow: "auto", margin: "8px 0 24px", border: `1px solid ${borderColor}`, borderRadius: 8 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  borderBottom: `1px solid ${borderColor}`,
                  color: textSecondary,
                  fontWeight: 600,
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: "10px 14px",
                    borderBottom: i === rows.length - 1 ? "none" : `1px solid ${borderColor}`,
                    verticalAlign: "top",
                    lineHeight: 1.55,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocsInlink({ slug, children }: { slug: DocsSlug; children: ReactNode }): ReactNode {
  const locale = useDocsLocale();
  return (
    <Link to={docsHref(locale, slug)} style={{ color: accentColor }}>
      {children}
    </Link>
  );
}

export function DocsCode({ children }: { children: ReactNode }): ReactNode {
  return (
    <code
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: "0.9em",
        padding: "1px 6px",
        background: "#1c1c22",
        borderRadius: 4,
      }}
    >
      {children}
    </code>
  );
}

export function DocsPager({ current }: { current: DocsSlug }): ReactNode {
  const locale = useDocsLocale();
  const links = docsNav(locale).flatMap((group) => group.items);
  const index = links.findIndex((item) => item.slug === current);
  const prev = index > 0 ? links[index - 1] : undefined;
  const next = index >= 0 && index < links.length - 1 ? links[index + 1] : undefined;

  if (!prev && !next) {
    return null;
  }

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        marginTop: 48,
        paddingTop: 20,
        borderTop: `1px solid ${borderColor}`,
      }}
    >
      {prev ? (
        <Link to={prev.path} style={{ color: accentColor, textDecoration: "none" }}>
          ← {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={next.path} style={{ color: accentColor, textDecoration: "none" }}>
          {next.title} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
