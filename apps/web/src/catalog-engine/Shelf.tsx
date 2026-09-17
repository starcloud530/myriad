import { Empty, Input, Segmented, Typography } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useCatalog } from "../features/capability/useCatalog.ts";
import { getDevApiKey } from "../lib/devKey.ts";
import { textSecondary } from "../tokens/theme.ts";
import { ModelCard } from "./Card.tsx";
import { filterModels, listModels } from "./load.ts";
import { modalityLabel } from "./price.ts";
import type { ModelRecord } from "./spec.ts";
import { modelKey } from "./spec.ts";
import { VendorMark } from "./VendorMark.tsx";
import { groupByVendor, vendorMeta } from "./vendors.ts";

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 12,
};

const filters: Array<{ label: string; value: "all" | ModelRecord["modality"] }> = [
  { label: "全部", value: "all" },
  { label: modalityLabel.text, value: "text" },
  { label: modalityLabel.image, value: "image" },
  { label: modalityLabel.video, value: "video" },
  { label: modalityLabel.audio, value: "audio" },
];

export function ModelShelf({
  title,
  intro,
}: {
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

  return (
    <div style={{ display: "grid", gap: 16, width: "100%" }}>
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {intro ? (
          <Typography.Paragraph style={{ color: textSecondary, margin: "6px 0 0" }}>{intro}</Typography.Paragraph>
        ) : null}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <Segmented
          size="small"
          options={filters}
          value={modality}
          onChange={(value) => {
            setModality(value as "all" | ModelRecord["modality"]);
          }}
        />
        <Input.Search
          allowClear
          size="small"
          placeholder="搜索型号、厂商或介绍"
          style={{ width: 260 }}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
        <div style={{ marginLeft: "auto" }}>
          <Segmented
            size="small"
            value={layout}
            options={[
              { label: "模型", value: "model" },
              { label: "厂商", value: "vendor" },
            ]}
            onChange={(value) => {
              setLayout(value as "model" | "vendor");
            }}
          />
        </div>
      </div>
      {visible.length === 0 ? (
        <Empty description={all.length === 0 ? "catalog/models 里还没有型号文件。" : "没有匹配的模型"} />
      ) : layout === "model" ? (
        <section style={gridStyle}>
          {visible.map((model) => (
            <ModelCard key={modelKey(model)} model={model} capability={byId.get(model.capability)} />
          ))}
        </section>
      ) : (
        <div style={{ display: "grid", gap: 22 }}>
          {vendorGroups.map((group) => {
            const meta = vendorMeta(group.vendor);
            return (
              <section key={group.vendor} style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <VendorMark vendor={group.vendor} size={28} />
                  <div>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {meta.name}
                    </Typography.Title>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {group.vendor === "myriad" ? "自建" : "渠道"} · {group.items.length}
                    </Typography.Text>
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
    </div>
  );
}
