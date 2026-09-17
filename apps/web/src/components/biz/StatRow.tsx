import type { CSSProperties, ReactNode } from "react";
import { borderColor, cardShadow, surfaceBg, textPrimary, textSecondary } from "../../tokens/theme.ts";

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
};

export function StatRow({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}): ReactNode {
  return (
    <div style={grid}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            padding: "18px 20px",
            background: surfaceBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 8,
            boxShadow: cardShadow,
          }}
        >
          <div style={{ color: textSecondary, fontSize: 12, letterSpacing: "0.06em" }}>{item.label}</div>
          <div style={{ fontSize: 26, fontWeight: 680, lineHeight: 1.25, marginTop: 8, color: textPrimary }}>
            {item.value}
          </div>
          {item.hint ? (
            <div style={{ color: textSecondary, fontSize: 12, marginTop: 6 }}>{item.hint}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
