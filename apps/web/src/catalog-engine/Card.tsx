import { Tag, Typography } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router";
import type { PublicCapability } from "../features/capability/types.ts";
import { borderColor, downColor, liveColor, surfaceBg, textPrimary, textSecondary } from "../tokens/theme.ts";
import { contextLabel, shelfHealth, unitLabel } from "./health.ts";
import { modeLabel, modalityLabel, priceSummary } from "./price.ts";
import { modelHref } from "./spec.ts";
import type { ModelRecord } from "./spec.ts";
import { VendorMark } from "./VendorMark.tsx";

const cardStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  minHeight: 168,
  padding: 14,
  background: surfaceBg,
  border: `1px solid ${borderColor}`,
  borderRadius: 10,
  color: textPrimary,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 1.3,
};

const priceStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "-0.01em",
};

export function ModelCard({
  model,
  capability,
}: {
  model: ModelRecord;
  capability?: PublicCapability | null;
}): ReactNode {
  const health = shelfHealth(model, capability);
  const context = contextLabel(model);
  const healthColor = health.status === "live" ? liveColor : downColor;

  return (
    <Link to={modelHref(model)} style={{ textDecoration: "none" }}>
      <article className="model-card" style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <VendorMark vendor={model.vendor} />
          <span style={{ fontSize: 12, color: healthColor }}>{health.label}</span>
        </div>
        <div>
          <h3 style={titleStyle}>{model.name}</h3>
          <Typography.Text style={{ color: textSecondary, fontSize: 12 }}>{model.vendor_model}</Typography.Text>
        </div>
        <div style={priceStyle}>{priceSummary(model.pricing)}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <Tag style={{ marginInlineEnd: 0 }}>{modalityLabel[model.modality]}</Tag>
          <Tag style={{ marginInlineEnd: 0 }}>{modeLabel[model.mode]}</Tag>
          <Tag style={{ marginInlineEnd: 0 }}>{unitLabel(model)}</Tag>
          {context ? <Tag style={{ marginInlineEnd: 0 }}>{context}</Tag> : null}
        </div>
        <Typography.Text style={{ color: textSecondary, fontSize: 12 }}>{health.channels}</Typography.Text>
      </article>
    </Link>
  );
}
