import type { ReactNode } from "react";
import { Link } from "react-router";
import type { PublicCapability } from "../features/capability/types.ts";
import { useLocale } from "../i18n/Locale.tsx";
import { StatusDot } from "../components/ui/StatusDot.tsx";
import { borderColor, textSecondary } from "../tokens/theme.ts";
import { contextLabel, shelfHealth, unitLabel } from "./health.ts";
import { modeLabel, modalityLabel, priceSummary } from "./price.ts";
import { modelHref } from "./spec.ts";
import type { ModelRecord } from "./spec.ts";
import { modelLabel, vendorLabel } from "./labels.ts";
import { VendorMark } from "./VendorMark.tsx";

export function ModelCard({
  model,
  capability,
}: {
  model: ModelRecord;
  capability?: PublicCapability | null;
}): ReactNode {
  const { locale, copy } = useLocale();
  const health = shelfHealth(model, copy, capability, locale);
  const context = contextLabel(model, copy);
  const on = health.status === "live";
  const modalities = modalityLabel(copy);
  const modes = modeLabel(copy);

  return (
    <Link to={modelHref(model)} className="shelf-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <VendorMark vendor={model.vendor} />
          <span style={{ color: textSecondary, fontSize: 12, fontWeight: 550 }}>{vendorLabel(model.vendor, locale)}</span>
        </div>
        <StatusDot live={on} label={health.label} />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 680, lineHeight: 1.3 }}>{modelLabel(model, locale)}</h3>
        <div style={{ color: textSecondary, fontSize: 12, marginTop: 5 }}>{model.vendor_model}</div>
      </div>
      <div style={{ fontSize: 16, fontWeight: 680, letterSpacing: "-0.02em", lineHeight: 1.4 }}>
        {priceSummary(model.pricing, copy)}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, color: textSecondary, fontSize: 12 }}>
        <span>{modalities[model.modality]}</span>
        <span>·</span>
        <span>{modes[model.mode]}</span>
        <span>·</span>
        <span>{unitLabel(model, copy)}</span>
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
    </Link>
  );
}
