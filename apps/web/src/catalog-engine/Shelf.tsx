import { Empty, Input, Segmented } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";
import { PageFrame } from "../components/biz/PageFrame.tsx";
import { PageHeader } from "../components/biz/PageHeader.tsx";
import { StatRow } from "../components/biz/StatRow.tsx";
import { useCatalog } from "../features/capability/useCatalog.ts";
import { getDevApiKey } from "../lib/devKey.ts";
import { textSecondary } from "../tokens/theme.ts";
import { ModelCard } from "./Card.tsx";
import { shelfHealth } from "./health.ts";
import { filterModels, listModels } from "./load.ts";
import { modalityLabel } from "./price.ts";
import type { ModelRecord } from "./spec.ts";
import { modelKey } from "./spec.ts";
import { VendorMark } from "./VendorMark.tsx";
import { groupByVendor, vendorMeta } from "./vendors.ts";

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 16,
};

const filters: Array<{ label: string; value: "all" | ModelRecord["modality"] }> = [
  { label: "全部", value: "all" },
  { label: modalityLabel.text, value: "text" },
  { label: modalityLabel.image, value: "image" },
  { label: modalityLabel.video, value: "video" },
  { label: modalityLabel.audio, value: "audio" },
];

export function ModelShelf({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}): ReactNode {
  const all = useMemo(() => listModels(), []);
  const { capabilities } = useCatalog(getDevApiKey());
  const byId = useMemo(() => new Map(capabilities.map((item) => [item.id, item])), [capabilities]);
  const [query, setQuery] = useState("");
  const [modality, setModality] = useState<"all" | ModelRecord["modality"]>("all");
  const [layout, setLayout] = useState<"model" | "vendor">("model");

  const visible = useMemo(() => filterModels(all, query, modality), [all, modality, query]);
  const vendorGroups = useMemo(() => groupByVendor(visible), [visible]);
  const liveCount = all.filter((model) => shelfHealth(model, byId.get(model.capability)).status === "live").length;
  const vendorCount = new Set(all.map((model) => model.vendor)).size;

  return (
    <PageFrame>
      <PageHeader eyebrow={eyebrow} title={title} description={intro} />
      <StatRow
        items={[
          { label: "模型", value: String(all.length) },
          { label: "厂商", value: String(vendorCount) },
          { label: "可用", value: String(liveCount) },
        ]}
      />
      <div className="paper-toolbar">
        <Segmented
          options={filters}
          value={modality}
          onChange={(value) => {
            setModality(value as "all" | ModelRecord["modality"]);
          }}
        />
        <Input.Search
          allowClear
          placeholder="搜索模型或厂商"
          style={{ width: 280 }}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
        <div style={{ marginLeft: "auto" }}>
          <Segmented
            value={layout}
            options={[
              { label: "按模型", value: "model" },
              { label: "按厂商", value: "vendor" },
            ]}
            onChange={(value) => {
              setLayout(value as "model" | "vendor");
            }}
          />
        </div>
      </div>
      {visible.length === 0 ? (
        <Empty description={all.length === 0 ? "还没有可展示的模型" : "没有匹配的模型"} />
      ) : layout === "model" ? (
        <section style={gridStyle}>
          {visible.map((model) => (
            <ModelCard key={modelKey(model)} model={model} capability={byId.get(model.capability)} />
          ))}
        </section>
      ) : (
        <div style={{ display: "grid", gap: 32 }}>
          {vendorGroups.map((group) => {
            const meta = vendorMeta(group.vendor);
            return (
              <section key={group.vendor} style={{ display: "grid", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <VendorMark vendor={group.vendor} size={32} />
                  <div>
                    <div style={{ fontWeight: 680 }}>{meta.name}</div>
                    <div style={{ fontSize: 12, color: textSecondary }}>{group.items.length} 个模型</div>
                  </div>
                </div>
                <div style={gridStyle}>
                  {group.items.map((model) => (
                    <ModelCard key={modelKey(model)} model={model} capability={byId.get(model.capability)} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </PageFrame>
  );
}
