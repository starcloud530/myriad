import { Empty } from "antd";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { PageFrame } from "../components/biz/PageFrame.tsx";
import { PageHeader } from "../components/biz/PageHeader.tsx";
import { MeterStrip } from "../components/viz/MeterStrip.tsx";
import { useCatalog } from "../features/capability/useCatalog.ts";
import { useLocale } from "../i18n/Locale.tsx";
import { getDevApiKey } from "../lib/devKey.ts";
import { ModelCard } from "./Card.tsx";
import { shelfHealth } from "./health.ts";
import { vendorLabel } from "./labels.ts";
import { filterModels, listModels } from "./load.ts";
import { modalityLabel } from "./price.ts";
import type { ModelRecord } from "./spec.ts";
import { modelKey } from "./spec.ts";
import { VendorMark } from "./VendorMark.tsx";
import { groupByVendor } from "./vendors.ts";
import "./shelf.css";

type ModalityFilter = "all" | ModelRecord["modality"];
type ShelfLayout = "model" | "vendor";

export function ModelShelf({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}): ReactNode {
  const { locale, copy } = useLocale();
  const all = useMemo(() => listModels(), []);
  const { capabilities } = useCatalog(getDevApiKey());
  const byId = useMemo(() => new Map(capabilities.map((item) => [item.id, item])), [capabilities]);
  const [query, setQuery] = useState("");
  const [modality, setModality] = useState<ModalityFilter>("all");
  const [layout, setLayout] = useState<ShelfLayout>("model");
  const modalities = modalityLabel(copy);

  const visible = useMemo(() => filterModels(all, query, modality), [all, modality, query]);
  const vendorGroups = useMemo(() => groupByVendor(visible), [visible]);
  const liveCount = all.filter((model) => shelfHealth(model, copy, byId.get(model.capability), locale).status === "live").length;
  const vendorCount = new Set(all.map((model) => model.vendor)).size;
  const filters: Array<{ label: string; value: ModalityFilter; count: number }> = [
    { label: copy.shelf.all, value: "all", count: all.length },
    { label: modalities.text, value: "text", count: all.filter((item) => item.modality === "text").length },
    { label: modalities.image, value: "image", count: all.filter((item) => item.modality === "image").length },
    { label: modalities.video, value: "video", count: all.filter((item) => item.modality === "video").length },
    { label: modalities.audio, value: "audio", count: all.filter((item) => item.modality === "audio").length },
  ];

  return (
    <PageFrame>
      <PageHeader eyebrow={eyebrow} title={title} description={intro} />
      <MeterStrip
        items={[
          { label: copy.shelf.models, value: String(all.length) },
          { label: copy.shelf.vendors, value: String(vendorCount) },
          { label: copy.shelf.live, value: String(liveCount) },
        ]}
      />
      <div className="shelf-toolbar">
        <div className="shelf-facets">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              className={modality === item.value ? "shelf-facet is-on" : "shelf-facet"}
              aria-pressed={modality === item.value}
              onClick={() => {
                setModality(item.value);
              }}
            >
              {item.label}
              <span className="shelf-facet-n">{item.count}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          className="shelf-find"
          placeholder={copy.shelf.search}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
        <div className="shelf-layouts">
          <button
            type="button"
            className={layout === "model" ? "shelf-layout is-on" : "shelf-layout"}
            aria-pressed={layout === "model"}
            onClick={() => setLayout("model")}
          >
            {copy.shelf.byModel}
          </button>
          <button
            type="button"
            className={layout === "vendor" ? "shelf-layout is-on" : "shelf-layout"}
            aria-pressed={layout === "vendor"}
            onClick={() => setLayout("vendor")}
          >
            {copy.shelf.byVendor}
          </button>
        </div>
      </div>
      {visible.length === 0 ? (
        <Empty description={all.length === 0 ? copy.shelf.empty : copy.shelf.none} />
      ) : layout === "model" ? (
        <section className="shelf-grid">
          {visible.map((model) => (
            <ModelCard key={modelKey(model)} model={model} capability={byId.get(model.capability)} />
          ))}
        </section>
      ) : (
        <div className="shelf-groups">
          {vendorGroups.map((group) => (
            <section key={group.vendor} className="shelf-group">
              <div className="shelf-group-head">
                <VendorMark vendor={group.vendor} size={32} />
                <div>
                  <div className="shelf-group-name">{vendorLabel(group.vendor, locale)}</div>
                  <div className="shelf-group-n">{copy.shelf.count(group.items.length)}</div>
                </div>
              </div>
              <div className="shelf-grid">
                {group.items.map((model) => (
                  <ModelCard key={modelKey(model)} model={model} capability={byId.get(model.capability)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageFrame>
  );
}
