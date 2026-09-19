import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ErrorHint } from "../components/biz/ErrorHint.tsx";
import { PageFrame } from "../components/biz/PageFrame.tsx";
import { SpecChip } from "../components/ui/SpecChip.tsx";
import { StatusDot } from "../components/ui/StatusDot.tsx";
import type { Locale } from "../i18n/locale.ts";
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
import { modelLabel, vendorLabel } from "./labels.ts";
import { formatMoney, type FxQuote } from "./fx.ts";
import { usePriceText } from "./Fx.tsx";
import { modeLabel, modalityLabel } from "./price.ts";
import type { ModelRecord } from "./spec.ts";
import { VendorMark } from "./VendorMark.tsx";

function pricingRows(
  model: ModelRecord,
  copy: Messages,
  locale: Locale,
  fx: FxQuote,
  summary: (pricing: ModelRecord["pricing"]) => string,
): Array<{ key: string; item: string; amount: string }> {
  const rows: Array<{ key: string; item: string; amount: string }> = [];
  const { pricing } = model;
  const missing = copy.detail.missing;
  const money = (cny: number | null): string => (cny == null ? missing : formatMoney(cny, locale, fx));
  if (pricing.prompt) {
    rows.push({
      key: "prompt",
      item: copy.detail.input,
      amount: pricing.prompt.cny_per_million == null ? missing : `${money(pricing.prompt.cny_per_million)} / 1M token`,
    });
  }
  if (pricing.completion) {
    rows.push({
      key: "completion",
      item: copy.detail.output,
      amount: pricing.completion.cny_per_million == null ? missing : `${money(pricing.completion.cny_per_million)} / 1M token`,
    });
  }
  if (pricing.cache_read) {
    rows.push({
      key: "cache",
      item: copy.detail.cache,
      amount: pricing.cache_read.cny_per_million == null ? missing : `${money(pricing.cache_read.cny_per_million)} / 1M token`,
    });
  }
  if (pricing.image) {
    rows.push({
      key: "image",
      item: copy.detail.perImage,
      amount: pricing.image.cny_per_unit == null ? missing : `${money(pricing.image.cny_per_unit)} ${copy.labels.perImage}`,
    });
  }
  if (pricing.second) {
    rows.push({
      key: "second",
      item: pricing.unit === "audio_second" ? copy.detail.perAudio : copy.detail.perVideo,
      amount:
        pricing.second.cny_per_unit == null
          ? missing
          : `${money(pricing.second.cny_per_unit)} / ${pricing.unit === "audio_second" ? copy.labels.audioSec : copy.labels.videoSec}`,
    });
  }
  if (rows.length === 0) {
    rows.push({ key: "unit", item: copy.detail.unit, amount: summary(pricing) });
  }
  return rows;
}

type DetailTab = "try" | "api" | "about" | "pricing";

export function ModelDetail({ model }: { model: ModelRecord }): ReactNode {
  const { locale, copy } = useLocale();
  const { fx, summary, note } = usePriceText();
  const { keys, selectedId, secret, setSelectedId, captureSecret } = useProductKeys();
  const apiKey = secret;
  const [tab, setTab] = useState<DetailTab>("try");
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

  const health = shelfHealth(model, copy, capability, locale);
  const context = contextLabel(model, copy);
  const modalities = modalityLabel(copy);
  const modes = modeLabel(copy);
  const prices = pricingRows(model, copy, locale, fx, summary);
  const specs: Array<{ label: string; value: string }> = [
    { label: copy.detail.vendor, value: vendorLabel(model.vendor, locale) },
    { label: copy.detail.id, value: model.id },
    { label: copy.detail.upstream, value: model.vendor_model },
    { label: copy.detail.protocol, value: model.kind },
    { label: copy.detail.capability, value: model.capability },
  ];
  if (context) {
    specs.push({ label: copy.detail.context, value: context });
  }
  if (health.channels) {
    specs.push({ label: copy.labels.live, value: health.channels });
  }

  const tabs: Array<{ id: DetailTab; label: string }> = [
    { id: "try", label: copy.detail.try },
    { id: "api", label: copy.detail.api },
    { id: "about", label: copy.detail.about },
    { id: "pricing", label: copy.detail.pricing },
  ];

  return (
    <PageFrame fill>
      <div className="bench-head">
        <Link to="/playground" className="bench-crumb">
          {copy.play.breadcrumb}
        </Link>
        <span className="bench-crumb-rule">/</span>
        <span>{modelLabel(model, locale)}</span>
      </div>
      <header className="bench-title">
        <VendorMark vendor={model.vendor} size={44} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 680, letterSpacing: "-0.03em" }}>{modelLabel(model, locale)}</h1>
            <StatusDot live={health.status === "live"} label={health.label} />
          </div>
          <div style={{ color: textSecondary, fontSize: 13, marginTop: 4 }}>
            {vendorLabel(model.vendor, locale)} · {model.vendor_model}
            {health.channels ? ` · ${health.channels}` : ""}
          </div>
        </div>
        <div className="bench-chips">
          <SpecChip>{modalities[model.modality]}</SpecChip>
          <SpecChip>{modes[model.mode]}</SpecChip>
          <SpecChip>{summary(model.pricing)}</SpecChip>
          {context ? <SpecChip>{context}</SpecChip> : null}
        </div>
      </header>
      <div className="bench">
        <div className="bench-tabs" role="tablist">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={tab === item.id ? "bench-tab is-on" : "bench-tab"}
              onClick={() => {
                setTab(item.id);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="bench-panel" role="tabpanel">
          {tab === "try" ? (
            <div className="pane pane-fill">
              <TokenPicker
                keys={keys}
                value={selectedId}
                secret={secret}
                onChange={setSelectedId}
                onSecret={captureSecret}
              />
              {!loading && !capability ? <ErrorHint message={error || copy.detail.unavailable} /> : null}
              <TryPlay apiKey={apiKey} model={model} />
            </div>
          ) : null}
          {tab === "api" ? <CapabilityApiDocs model={model} capability={capability} /> : null}
          {tab === "about" ? (
            <div className="about-split">
              <article className="pane pane-fill">
                <div className="pane-kicker">{copy.detail.about}</div>
                <p className="about-body">{model.description || copy.detail.noAbout}</p>
                {model.docs ? (
                  <a className="about-link" href={model.docs} target="_blank" rel="noreferrer">
                    {model.docs}
                  </a>
                ) : null}
              </article>
              <div className="spec-grid">
                {specs.map((item) => (
                  <div key={item.label} className="spec-cell">
                    <div className="pane-kicker">{item.label}</div>
                    <div className="spec-value">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {tab === "pricing" ? (
            <div className="pane" style={{ display: "grid", gap: 16 }}>
              <div className="pane-kicker">
                {model.pricing.source === "estimate" ? copy.detail.estimate : copy.detail.list}
                {model.pricing.as_of ? ` · ${model.pricing.as_of}` : ""}
                {` · ${note}`}
              </div>
              <div className="price-grid">
                {prices.map((row) => (
                  <div key={row.key} className="price-tile">
                    <div className="pane-kicker">{row.item}</div>
                    <div className="price-amount">{row.amount}</div>
                  </div>
                ))}
              </div>
              <div className="price-table">
                {prices.map((row) => (
                  <div key={`row-${row.key}`} className="price-row">
                    <span>{row.item}</span>
                    <span>{row.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </PageFrame>
  );
}
