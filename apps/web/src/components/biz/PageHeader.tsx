import { Typography } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { textSecondary } from "../../tokens/theme.ts";

const bar: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

export function PageHeader({
  title,
  description,
  extra,
}: {
  title: string;
  description?: string;
  extra?: ReactNode;
}): ReactNode {
  return (
    <div>
      <div style={bar}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {extra ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{extra}</div> : null}
      </div>
      {description ? (
        <Typography.Paragraph style={{ color: textSecondary, margin: "8px 0 0" }}>
          {description}
        </Typography.Paragraph>
      ) : null}
    </div>
  );
}
