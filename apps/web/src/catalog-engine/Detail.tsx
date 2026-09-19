import { CopyOutlined } from "@ant-design/icons";
import { message } from "antd";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ErrorHint } from "../components/biz/ErrorHint.tsx";
import { SpecChip } from "../components/ui/SpecChip.tsx";
import { StatusDot } from "../components/ui/StatusDot.tsx";
import { publicBaseUrl } from "../features/keys/origins.ts";
import { TokenPicker } from "../features/keys/TokenPicker.tsx";
import { useProductKeys } from "../features/keys/useProductKeys.ts";
import type { Locale } from "../i18n/locale.ts";
import type { Messages } from "../i18n/messages.ts";
import { useLocale } from "../i18n/Locale.tsx";
import { TryPlay } from "../features/invoke/TryPlay.tsx";
import type { PublicCapability } from "../features/capability/types.ts";
import { getCapability } from "../lib/api.ts";
import { ApiAccess } from "./ApiAccess.tsx";
import { requestPath } from "./api-spec.ts";
import { formatMoney, type FxQuote } from "./fx.ts";
import { usePriceText } from "./Fx.tsx";
import { shelfHealth } from "./health.ts";
import { modelLabel } from "./labels.ts";
import { abilityChips, heroChips, ioTypes, limitCells, toolChips } from "./sheet.ts";
import type { ModelRecord } from "./spec.ts";
import { VendorMark } from "./VendorMark.tsx";

function pricingRows(
  model: ModelRecord,
  copy: Messages,
  locale: Locale,
  fx: FxQuote,
  summary: (pricing: ModelRecord["pricing"]) => string,
): Array<{ key: string; item: string; figure: string; unit: string }> {
  const rows: Array<{ key: string; item: string; figure: string; unit: string }> = [];
  const { pricing } = model;
  const missing = copy.detail.missing;
  const money = (cny: number | null): string => (cny == null ? missing : formatMoney(cny, locale, fx));
  if (pricing.prompt) {
    rows.push({
      key: "prompt",
      item: copy.detail.input,
      figure: money(pricing.prompt.cny_per_million),
      unit: copy.detail.perMillionUnit,
    });
  }
  if (pricing.completion) {
    rows.push({
      key: "completion",
      item: copy.detail.output,
      figure: money(pricing.completion.cny_per_million),
      unit: copy.detail.perMillionUnit,
    });
  }
  if (pricing.cache_read) {
    rows.push({
      key: "cache",
      item: copy.detail.cache,
      figure: money(pricing.cache_read.cny_per_million),
      unit: copy.detail.perMillionUnit,
    });
  }
  if (pricing.image) {
    rows.push({
      key: "image",
      item: copy.detail.perImage,
      figure: money(pricing.image.cny_per_unit),
      unit: copy.labels.perImage,
    });
  }
  if (pricing.second) {
    rows.push({
      key: "second",
      item: pricing.unit === "audio_second" ? copy.detail.perAudio : copy.detail.perVideo,
      figure: money(pricing.second.cny_per_unit),
      unit: `/ ${pricing.unit === "audio_second" ? copy.labels.audioSec : copy.labels.videoSec}`,
    });
  }
  if (rows.length === 0) {
    rows.push({ key: "unit", item: copy.detail.unit, figure: summary(pricing), unit: "" });
  }
  return rows;
}

function jumpTo(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ModelDetail({ model }: { model: ModelRecord }): ReactNode {
  const { locale, copy } = useLocale();
  const { fx, summary, note } = usePriceText();
  const { keys, selectedId, secret, setSelectedId, captureSecret } = useProductKeys();
  const [params, setParams] = useSearchParams();
  const connect = params.get("connect") === "1";
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

  const health = shelfHealth(model, copy, capability, locale);
  const prices = pricingRows(model, copy, locale, fx, summary);
  const io = ioTypes(model, copy);
  const chips = heroChips(model, copy);
  const abilities = abilityChips(model, copy);
  const tools = toolChips(model, copy);
  const limits = limitCells(model, copy);
  const modelId = model.vendor_model || model.id;
  const path = requestPath(model.capability);
  const baseUrl = publicBaseUrl();
  const toc: Array<{ id: string; label: string }> = [{ id: "overview", label: copy.detail.describe }];
  if (abilities.length) {
    toc.push({ id: "features", label: copy.detail.abilities });
  }
  if (tools.length) {
    toc.push({ id: "tools", label: copy.detail.tools });
  }
  toc.push({ id: "pricing", label: copy.detail.pricing });
  if (limits.length) {
    toc.push({ id: "limits", label: copy.detail.limits });
  }
  toc.push({ id: "api", label: copy.detail.apiScope });

  const copyModelId = (): void => {
    void navigator.clipboard.writeText(modelId).then(() => {
      void message.success(copy.keys.copied);
    });
  };

  const openConnect = (): void => {
    const next = new URLSearchParams(params);
    next.set("connect", "1");
    setParams(next, { replace: false });
  };

  const closeConnect = (): void => {
    const next = new URLSearchParams(params);
    next.delete("connect");
    setParams(next, { replace: true });
  };

  return (
    <>
      <div className="studio">
        <div className="studio-bar">
          <div className="bench-head">
            <Link to="/playground" className="bench-crumb">
              {copy.play.breadcrumb}
            </Link>
            <span className="bench-crumb-rule">/</span>
            <span>{modelLabel(model, locale)}</span>
          </div>
          <button type="button" className="btn-ghost" onClick={openConnect}>
            {copy.detail.connect}
          </button>
        </div>
        <div className="studio-body">
          <nav className="studio-toc" aria-label={copy.detail.toc}>
            <div className="studio-toc-kicker">{copy.detail.toc}</div>
            {toc.map((item) => (
              <button key={item.id} type="button" className="studio-toc-link" onClick={() => jumpTo(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
          <article className="studio-doc">
            <header id="overview" className="sheet-hero">
              <div className="studio-title">
                <VendorMark vendor={model.vendor} size={40} />
                <div>
                  <h1>{modelLabel(model, locale)}</h1>
                  <div className="studio-idline">
                    <StatusDot live={health.status === "live"} label={health.label} />
                    <button type="button" className="bench-id" onClick={copyModelId} title={copy.detail.copyId}>
                      {copy.detail.modelId}: {modelId}
                      <CopyOutlined />
                    </button>
                  </div>
                </div>
              </div>
              <p className="sheet-lead">{model.description || copy.detail.noAbout}</p>
              {chips.length ? (
                <div className="bench-chips">
                  {chips.map((chip) => (
                    <SpecChip key={chip}>{chip}</SpecChip>
                  ))}
                </div>
              ) : null}
              <div className="identity-stats">
                <div className="identity-stat">
                  <h3>{copy.detail.priceCard}</h3>
                  <div className="identity-prices">
                    {prices.slice(0, 2).map((row) => (
                      <div key={row.key}>
                        <span>{row.item}</span>
                        <strong>{row.figure}</strong>
                      </div>
                    ))}
                  </div>
                  <p>{prices[0]?.unit || copy.detail.perMillionUnit}</p>
                </div>
                <div className="identity-stat">
                  <h3>{copy.detail.ioTypes}</h3>
                  <p className="identity-io">
                    {io.input}
                    <span> | </span>
                    {io.output}
                  </p>
                </div>
              </div>
            </header>
            {abilities.length ? (
              <section id="features" className="sheet-block">
                <h2>{copy.detail.abilities}</h2>
                <ul className="ability-grid">
                  {abilities.map((item) => (
                    <li key={item.key} className={item.on ? "is-on" : undefined}>
                      <i />
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {tools.length ? (
              <section id="tools" className="sheet-block">
                <h2>{copy.detail.tools}</h2>
                <ul className="ability-grid">
                  {tools.map((item) => (
                    <li key={item.key} className={item.on ? "is-on" : undefined}>
                      <i />
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <section id="pricing" className="sheet-block">
              <h2>{copy.detail.pricing}</h2>
              <p className="sheet-note">
                {model.pricing.source === "estimate" ? copy.detail.estimate : copy.detail.list}
                {model.pricing.as_of ? ` · ${model.pricing.as_of}` : ""}
                {` · ${note}`}
              </p>
              <div className="price-grid">
                {prices.map((row) => (
                  <div key={row.key} className="price-tile">
                    <div className="price-item">{row.item}</div>
                    <div className="price-amount">{row.figure}</div>
                    {row.unit ? <div className="price-unit">{row.unit}</div> : null}
                  </div>
                ))}
              </div>
            </section>
            {limits.length ? (
              <section id="limits" className="sheet-block">
                <h2>{copy.detail.limits}</h2>
                <dl className="limit-grid">
                  {limits.map((item) => (
                    <div key={item.key} className="limit-cell">
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
            <section id="api" className="sheet-block">
              <h2>{copy.detail.apiScope}</h2>
              <ul className="api-scope">
                <li>
                  <span>{copy.detail.baseUrl}</span>
                  <code>{baseUrl}</code>
                </li>
                <li>
                  <span>{copy.detail.frequency}</span>
                  <code>POST {path}</code>
                </li>
              </ul>
              {model.docs ? (
                <a className="about-link" href={model.docs} target="_blank" rel="noreferrer">
                  {copy.detail.viewDocs}
                </a>
              ) : null}
            </section>
          </article>
          <aside className="studio-app">
            <header className="gradio-head">
              <h2>{copy.detail.tryApp}</h2>
              <StatusDot live={health.status === "live"} label={health.label} />
            </header>
            <div className="gradio-key">
              <TokenPicker
                keys={keys}
                value={selectedId}
                secret={secret}
                onChange={setSelectedId}
                onSecret={captureSecret}
              />
            </div>
            {!loading && !capability ? <ErrorHint message={error || copy.detail.unavailable} /> : null}
            <div className="gradio-stage">
              <TryPlay apiKey={apiKey} model={model} />
            </div>
          </aside>
        </div>
      </div>
      <ApiAccess model={model} open={connect} onClose={closeConnect} />
    </>
  );
}
