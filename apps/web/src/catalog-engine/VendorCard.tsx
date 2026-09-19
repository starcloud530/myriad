import type { ReactNode } from "react";
import { Link } from "react-router";
import type { PublicCapability } from "../features/capability/types.ts";
import { useLocale } from "../i18n/Locale.tsx";
import { shelfHealth } from "./health.ts";
import { modelLabel, vendorLabel } from "./labels.ts";
import { modalityLabel } from "./price.ts";
import { modelHref, modelKey } from "./spec.ts";
import type { ModelRecord } from "./spec.ts";
import { VendorMark } from "./VendorMark.tsx";

export function VendorCard({
  vendor,
  items,
  capabilities,
}: {
  vendor: string;
  items: ModelRecord[];
  capabilities: Map<string, PublicCapability>;
}): ReactNode {
  const { locale, copy } = useLocale();
  const modalities = modalityLabel(copy);
  const live = items.filter(
    (model) => shelfHealth(model, copy, capabilities.get(model.capability), locale).status === "live",
  ).length;

  return (
    <article className="shelf-vendor-card">
      <div className="shelf-vendor-head">
        <VendorMark vendor={vendor} size={36} />
        <div className="shelf-vendor-title">
          <h3>{vendorLabel(vendor, locale)}</h3>
          <p>
            {copy.shelf.count(items.length)}
            {live ? ` · ${copy.shelf.live} ${live}` : ""}
          </p>
        </div>
      </div>
      <ul className="shelf-vendor-models">
        {items.map((model) => (
          <li key={modelKey(model)}>
            <Link to={modelHref(model)}>
              <strong>{modelLabel(model, locale)}</strong>
              <span>
                {modalities[model.modality]}
                {model.vendor_model ? ` · ${model.vendor_model}` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
