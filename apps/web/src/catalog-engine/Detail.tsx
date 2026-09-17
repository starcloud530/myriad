import { Breadcrumb, Card, Descriptions, Table, Tabs, Tag, Typography } from "antd";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ErrorHint } from "../components/biz/ErrorHint.tsx";
import { PageFrame } from "../components/biz/PageFrame.tsx";
import type { Messages } from "../i18n/messages.ts";
import { useLocale } from "../i18n/Locale.tsx";
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

function pricingRows(model: ModelRecord, copy: Messages): Array<{ key: string; item: string; amount: string }> {
  const rows: Array<{ key: string; item: string; amount: string }> = [];
  const { pricing } = model;
  const missing = copy.detail.missing;
  if (pricing.prompt) {
    rows.push({
      key: "prompt",
      item: copy.detail.input,
      amount: pricing.prompt.cny_per_million == null ? missing : `¥${pricing.prompt.cny_per_million} ${copy.labels.perMillion} token`,
    });
  }
  if (pricing.completion) {
    rows.push({
      key: "completion",
      item: copy.detail.output,
      amount: pricing.completion.cny_per_million == null ? missing : `¥${pricing.completion.cny_per_million} ${copy.labels.perMillion} token`,
    });
  }
  if (pricing.cache_read) {
    rows.push({
      key: "cache",
      item: copy.detail.cache,
      amount: pricing.cache_read.cny_per_million == null ? missing : `¥${pricing.cache_read.cny_per_million} ${copy.labels.perMillion} token`,
    });
  }
  if (pricing.image) {
    rows.push({
      key: "image",
      item: copy.detail.perImage,
      amount: pricing.image.cny_per_unit == null ? missing : `¥${pricing.image.cny_per_unit} ${copy.labels.perImage}`,
    });
  }
  if (pricing.second) {
    rows.push({
      key: "second",
      item: pricing.unit === "audio_second" ? copy.detail.perAudio : copy.detail.perVideo,
      amount: pricing.second.cny_per_unit == null ? missing : `¥${pricing.second.cny_per_unit} / ${pricing.unit === "audio_second" ? copy.labels.audioSec : copy.labels.videoSec}`,
    });
  }
  if (rows.length === 0) {
    rows.push({ key: "unit", item: copy.detail.unit, amount: priceSummary(pricing, copy) });
  }
  return rows;
}

export function ModelDetail({ model }: { model: ModelRecord }): ReactNode {
  const { copy } = useLocale();
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
  const health = shelfHealth(model, copy, capability);
  const context = contextLabel(model, copy);
  const modalities = modalityLabel(copy);
  const modes = modeLabel(copy);

  return (
    <PageFrame>
      <Breadcrumb items={[{ title: <Link to="/playground">{copy.play.breadcrumb}</Link> }, { title: model.name }]} />
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
        <VendorMark vendor={model.vendor} size={56} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <Typography.Title level={2} style={{ margin: 0, fontSize: 30, fontWeight: 680, letterSpacing: "-0.03em" }}>
              {model.name}
            </Typography.Title>
            <Tag color={health.status === "live" ? "success" : "error"}>{health.label}</Tag>
          </div>
          <Typography.Text style={{ color: textSecondary }}>
            {meta.name} · {model.vendor_model}
            {health.channels ? ` · ${health.channels}` : ""}
          </Typography.Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            <Tag>{modalities[model.modality]}</Tag>
            <Tag>{modes[model.mode]}</Tag>
            <Tag>{priceSummary(model.pricing, copy)}</Tag>
            {context ? <Tag>{context}</Tag> : null}
          </div>
        </div>
      </div>
      <Tabs
        defaultActiveKey="try"
        items={[
          {
            key: "try",
            label: copy.detail.try,
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
                    <ErrorHint message={error || copy.detail.unavailable} />
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
            label: copy.detail.about,
            children: (
              <Card>
                <Typography.Paragraph style={{ marginTop: 0, whiteSpace: "pre-wrap" }}>
                  {model.description || copy.detail.noAbout}
                </Typography.Paragraph>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label={copy.detail.vendor}>{meta.name}</Descriptions.Item>
                  <Descriptions.Item label={copy.detail.id}>{model.id}</Descriptions.Item>
                  <Descriptions.Item label={copy.detail.upstream}>{model.vendor_model}</Descriptions.Item>
                  <Descriptions.Item label={copy.detail.protocol}>{model.kind}</Descriptions.Item>
                  <Descriptions.Item label={copy.detail.capability}>{model.capability}</Descriptions.Item>
                  {model.specs?.context_length != null ? (
                    <Descriptions.Item label={copy.detail.context}>{model.specs.context_length.toLocaleString()}</Descriptions.Item>
                  ) : null}
                  {model.docs ? (
                    <Descriptions.Item label={copy.detail.docs}>
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
            label: copy.detail.pricing,
            children: (
              <Card>
                <Typography.Paragraph type="secondary">
                  {model.pricing.source === "estimate" ? copy.detail.estimate : copy.detail.list}
                  {model.pricing.as_of ? ` · ${model.pricing.as_of}` : ""}
                </Typography.Paragraph>
                <Table
                  rowKey="key"
                  pagination={false}
                  size="middle"
                  dataSource={pricingRows(model, copy)}
                  columns={[
                    { title: copy.detail.item, dataIndex: "item" },
                    { title: copy.detail.price, dataIndex: "amount" },
                  ]}
                />
              </Card>
            ),
          },
        ]}
      />
    </PageFrame>
  );
}
