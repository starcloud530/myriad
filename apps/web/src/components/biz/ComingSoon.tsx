import type { ReactNode } from "react";
import { Link } from "react-router";
import { useLocale } from "../../i18n/Locale.tsx";
import { accentColor, borderColor, cardShadow, surfaceBg, textPrimary, textSecondary } from "../../tokens/theme.ts";
import { PageFrame } from "./PageFrame.tsx";
import { PageHeader } from "./PageHeader.tsx";

export function ComingSoon({
  title,
  description,
  points,
}: {
  title: string;
  description: string;
  points: string[];
}): ReactNode {
  const { copy } = useLocale();
  return (
    <PageFrame>
      <PageHeader eyebrow={copy.soon.eyebrow} title={title} description={description} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        {points.map((point, index) => (
          <div
            key={point}
            style={{
              padding: "22px 22px 20px",
              background: surfaceBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 8,
              boxShadow: cardShadow,
              minHeight: 140,
            }}
          >
            <div style={{ fontSize: 12, letterSpacing: "0.12em", color: accentColor, fontWeight: 650 }}>
              {String(index + 1).padStart(2, "0")}
            </div>
            <div style={{ marginTop: 14, fontSize: 16, lineHeight: 1.55, color: textPrimary, fontWeight: 550 }}>
              {point}
            </div>
          </div>
        ))}
      </div>
      <p style={{ margin: 0, color: textSecondary, fontSize: 14 }}>
        {copy.soon.now}
        <Link to="/keys" style={{ color: accentColor }}>
          {copy.soon.createKey}
        </Link>
        {copy.soon.or}
        <Link to="/playground" style={{ color: accentColor }}>
          {copy.soon.tryModel}
        </Link>
        .
      </p>
    </PageFrame>
  );
}
