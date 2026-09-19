import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { listModels } from "../../catalog-engine/load.ts";
import { modelLabel, vendorLabel } from "../../catalog-engine/labels.ts";
import { usePriceText } from "../../catalog-engine/Fx.tsx";
import { VendorMark } from "../../catalog-engine/VendorMark.tsx";
import { PageFrame } from "../../components/biz/PageFrame.tsx";
import { PageHeader } from "../../components/biz/PageHeader.tsx";
import { SearchField } from "../../components/ui/SearchField.tsx";
import { useLocale } from "../../i18n/Locale.tsx";
import "./admin.css";

function rowKey(vendor: string, id: string): string {
  return `${vendor}/${id}`;
}

export function PricingRulesPage(): ReactNode {
  const { locale, copy } = useLocale();
  const { summary, note } = usePriceText();
  const a = copy.admin;
  const models = useMemo(() => listModels(), []);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return models;
    }
    return models.filter((model) =>
      `${modelLabel(model, locale)} ${vendorLabel(model.vendor, locale)} ${model.id}`.toLowerCase().includes(needle),
    );
  }, [locale, models, query]);

  return (
    <PageFrame>
      <PageHeader eyebrow={a.priceEyebrow} title={a.priceTitle} description={`${a.priceIntro} ${note}`} />
      <div className="admin-price-rail">
        <SearchField
          placeholder={copy.shelf.search}
          value={query}
          style={{ width: "100%", maxWidth: 420, height: 36 }}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
        <div className="admin-price-views">
          <button
            type="button"
            className={view === "list" ? "admin-price-view is-on" : "admin-price-view"}
            onClick={() => setView("list")}
          >
            {a.listView}
          </button>
          <button
            type="button"
            className={view === "grid" ? "admin-price-view is-on" : "admin-price-view"}
            onClick={() => setView("grid")}
          >
            {a.gridView}
          </button>
        </div>
        <span className="admin-price-note admin-mono">{copy.shelf.count(visible.length)}</span>
      </div>
      {visible.length === 0 ? <div className="admin-empty">{copy.shelf.none}</div> : null}
      <div className={view === "grid" ? "admin-price-grid" : "admin-price-list"}>
        {visible.map((model, index) => (
          <article key={rowKey(model.vendor, model.id)} className="admin-price-row is-readonly">
            <span className="admin-price-idx admin-mono">{String(index + 1).padStart(2, "0")}</span>
            <VendorMark vendor={model.vendor} />
            <div className="admin-price-id">
              <strong>{modelLabel(model, locale)}</strong>
              <small>
                {vendorLabel(model.vendor, locale)} · {model.vendor_model}
              </small>
            </div>
            <div className="admin-price-read admin-mono">{summary(model.pricing)}</div>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}
