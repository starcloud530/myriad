import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router";
import type { PublicCapability } from "../features/capability/types.ts";
import {
  borderColor,
  cardShadow,
  downColor,
  liveColor,
  liveWash,
  downWash,
  surfaceBg,
  textPrimary,
  textSecondary,
} from "../tokens/theme.ts";
import { contextLabel, shelfHealth, unitLabel } from "./health.ts";
import { modeLabel, modalityLabel, priceSummary } from "./price.ts";
import { modelHref } from "./spec.ts";
import type { ModelRecord } from "./spec.ts";
import { VendorMark } from "./VendorMark.tsx";
import { vendorMeta } from "./vendors.ts";

const cardStyle: CSSProperties = {
  display: "grid",
  gap: 14,
  minHeight: 204,
  padding: "20px 20px 18px",
  background: surfaceBg,
  border: `1px solid ${borderColor}`,
  borderRadius: 14,
  boxShadow: cardShadow,
  color: textPrimary,
  height: "100%",
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
  const on = health.status === "live";
  const vendor = vendorMeta(model.vendor);

  return (
    <Link to={modelHref(model)} style={{ textDecoration: "none", color: "inherit" }}>
      <article className="model-card" style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <VendorMark vendor={model.vendor} />
            <span style={{ color: textSecondary, fontSize: 12, fontWeight: 550 }}>{vendor.name}</span>
          </div>
          <span
            className="status-pill"
            style={{
              color: on ? liveColor : downColor,
              background: on ? liveWash : downWash,
            }}
          >
            {health.label}
          </span>
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 680, lineHeight: 1.3 }}>{model.name}</h3>
          <div style={{ color: textSecondary, fontSize: 12, marginTop: 5 }}>{model.vendor_model}</div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 680, letterSpacing: "-0.02em", lineHeight: 1.4 }}>
          {priceSummary(model.pricing)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, color: textSecondary, fontSize: 12 }}>
          <span>{modalityLabel[model.modality]}</span>
          <span>·</span>
          <span>{modeLabel[model.mode]}</span>
          <span>·</span>
          <span>{unitLabel(model)}</span>
          {context ? (
            <>
              <span>·</span>
              <span>{context}</span>
            </>
          ) : null}
        </div>
        {health.channels ? (
          <div style={{ color: textSecondary, fontSize: 12, paddingTop: 2, borderTop: `1px solid ${borderColor}` }}>
            {health.channels}
          </div>
        ) : null}
      </article>
    </Link>
  );
}
