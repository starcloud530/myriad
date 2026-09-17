import type { CSSProperties, ReactNode } from "react";
import { textPrimary, textSecondary } from "../../tokens/theme.ts";

const bar: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
};

export function PageHeader({
  eyebrow,
  title,
  description,
  extra,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  extra?: ReactNode;
}): ReactNode {
  return (
    <div style={bar}>
      <div style={{ minWidth: 0, maxWidth: 720 }}>
        {eyebrow ? (
          <div
            style={{
              marginBottom: 8,
              fontSize: 12,
              letterSpacing: "0.08em",
              color: textSecondary,
              fontWeight: 600,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            lineHeight: 1.15,
            fontWeight: 680,
            letterSpacing: "-0.03em",
            color: textPrimary,
          }}
        >
          {title}
        </h1>
        {description ? (
          <p style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.7, color: textSecondary }}>{description}</p>
        ) : null}
      </div>
      {extra ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{extra}</div> : null}
    </div>
  );
}
