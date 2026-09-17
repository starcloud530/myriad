import { Card, Typography } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { textSecondary } from "../../tokens/theme.ts";

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
        <Card key={item.label} size="small">
          <Typography.Text style={{ color: textSecondary, fontSize: 12 }}>{item.label}</Typography.Text>
          <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.35, marginTop: 6 }}>{item.value}</div>
          {item.hint ? (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {item.hint}
            </Typography.Text>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
