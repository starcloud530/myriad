import { Breadcrumb, Card, Descriptions, Table, Tabs, Tag, Typography } from "antd";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ErrorHint } from "../components/biz/ErrorHint.tsx";
import { TryPlay } from "../features/invoke/TryPlay.tsx";
import { TokenPicker } from "../features/keys/TokenPicker.tsx";
import { useProductKeys } from "../features/keys/useProductKeys.ts";
import { CapabilityApiDocs } from "./ApiDocs.tsx";
import type { PublicCapability } from "../features/capability/types.ts";
import { getCapability } from "../lib/api.ts";
import { textSecondary } from "../tokens/theme.ts";
import { contextLabel, shelfHealth } from "./health.ts";
import { modeLabel, modalityLabel, priceSummary } from "./price.ts";
import type { ModelRecord } from "./spec.ts";
import { VendorMark } from "./VendorMark.tsx";
import { vendorMeta } from "./vendors.ts";

function pricingRows(model: ModelRecord): Array<{ key: string; item: string; amount: string }> {
  const rows: Array<{ key: string; item: string; amount: string }> = [];
  const { pricing } = model;
  if (pricing.prompt) {
    rows.push({
      key: "prompt",
      item: "输入",
      amount: pricing.prompt.cny_per_million == null ? "未录入" : `¥${pricing.prompt.cny_per_million} / 百万 token`,
    });
  }
  if (pricing.completion) {
    rows.push({
      key: "completion",
      item: "输出",
      amount: pricing.completion.cny_per_million == null ? "未录入" : `¥${pricing.completion.cny_per_million} / 百万 token`,
    });
  }
  if (pricing.cache_read) {
    rows.push({
      key: "cache",
      item: "缓存命中",
      amount: pricing.cache_read.cny_per_million == null ? "未录入" : `¥${pricing.cache_read.cny_per_million} / 百万 token`,
    });
  }
  if (pricing.image) {
    rows.push({
      key: "image",
      item: "每张",
      amount: pricing.image.cny_per_unit == null ? "未录入" : `¥${pricing.image.cny_per_unit} / 张`,
    });
  }
  if (pricing.second) {
    rows.push({
      key: "second",
      item: pricing.unit === "audio_second" ? "每音频秒" : "每视频秒",
      amount: pricing.second.cny_per_unit == null ? "未录入" : `¥${pricing.second.cny_per_unit} / 秒`,
    });
  }
  if (rows.length === 0) {
    rows.push({ key: "unit", item: "计费单位", amount: priceSummary(pricing) });
  }
  return rows;
}

export function ModelDetail({ model }: { model: ModelRecord }): ReactNode {
  const { keys, selectedId, secret, setSelectedId, captureSecret } = useProductKeys();
  const apiKey = secret;
  const [capability, setCapability] = useState<PublicCapability | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getCapability(apiKey, model.capability)
      .then((data) => {
        if (!cancelled) {
          setCapability(data.capability);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setCapability(null);
          setError(caught instanceof Error ? caught.message : String(caught));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey, model.capability]);

  const meta = vendorMeta(model.vendor);
  const health = shelfHealth(model, capability);
  const context = contextLabel(model);

  return (
    <div style={{ display: "grid", gap: 16, width: "100%" }}>
      <Breadcrumb
        items={[{ title: <Link to="/playground">模型广场</Link> }, { title: model.name }]}
      />
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <VendorMark vendor={model.vendor} size={48} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {model.name}
            </Typography.Title>
            <Tag color={health.status === "live" ? "success" : "error"}>{health.label}</Tag>
          </div>
          <Typography.Text style={{ color: textSecondary }}>
            {meta.name} · {model.vendor_model}
            {health.channels ? ` · ${health.channels}` : ""}
          </Typography.Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            <Tag>{modalityLabel[model.modality]}</Tag>
            <Tag>{modeLabel[model.mode]}</Tag>
            <Tag>{priceSummary(model.pricing)}</Tag>
            {context ? <Tag>{context}</Tag> : null}
          </div>
        </div>
      </div>
      <Tabs
        defaultActiveKey="try"
        items={[
          {
            key: "try",
            label: "试用",
            children: (
              <Card>
                <div style={{ display: "grid", gap: 16 }}>
                  <TokenPicker
                    keys={keys}
                    value={selectedId}
                    secret={secret}
                    onChange={setSelectedId}
                    onSecret={captureSecret}
                  />
                  {loading ? null : capability ? (
                    <TryPlay apiKey={apiKey} model={model} />
                  ) : (
                    <ErrorHint message={error || "网关尚未登记该能力，无法试用。"} />
                  )}
                </div>
              </Card>
            ),
          },
          {
            key: "docs",
            label: "API",
            children: (
              <Card>
                <CapabilityApiDocs model={model} capability={capability} />
              </Card>
            ),
          },
          {
            key: "about",
            label: "介绍",
            children: (
              <Card>
                <Typography.Paragraph style={{ marginTop: 0, whiteSpace: "pre-wrap" }}>
                  {model.description || "目录尚未写入介绍。"}
                </Typography.Paragraph>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="厂商">{meta.name}</Descriptions.Item>
                  <Descriptions.Item label="型号">{model.id}</Descriptions.Item>
                  <Descriptions.Item label="上游 id">{model.vendor_model}</Descriptions.Item>
                  <Descriptions.Item label="协议">{model.kind}</Descriptions.Item>
                  <Descriptions.Item label="调用能力">{model.capability}</Descriptions.Item>
                  {model.specs?.context_length != null ? (
                    <Descriptions.Item label="上下文">{model.specs.context_length.toLocaleString()}</Descriptions.Item>
                  ) : null}
                  {model.docs ? (
                    <Descriptions.Item label="文档">
                      <Typography.Link href={model.docs} target="_blank" rel="noreferrer">
                        {model.docs}
                      </Typography.Link>
                    </Descriptions.Item>
                  ) : null}
                </Descriptions>
              </Card>
            ),
          },
          {
            key: "pricing",
            label: "定价",
            children: (
              <Card>
                <Typography.Paragraph type="secondary">
                  货架快照，{model.pricing.source === "estimate" ? "估价" : "以官方刊例为准"}
                  {model.pricing.as_of ? ` · ${model.pricing.as_of}` : ""}。不是每次请求写库。
                </Typography.Paragraph>
                <Table
                  rowKey="key"
                  pagination={false}
                  size="middle"
                  dataSource={pricingRows(model)}
                  columns={[
                    { title: "项", dataIndex: "item" },
                    { title: "价格", dataIndex: "amount" },
                  ]}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
