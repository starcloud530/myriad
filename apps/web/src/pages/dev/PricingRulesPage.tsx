import type { KeyboardEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { listModels } from "../../catalog-engine/load.ts";
import { modelLabel, vendorLabel } from "../../catalog-engine/labels.ts";
import { VendorMark } from "../../catalog-engine/VendorMark.tsx";
import { PageFrame } from "../../components/biz/PageFrame.tsx";
import { PageHeader } from "../../components/biz/PageHeader.tsx";
import { SearchField } from "../../components/ui/SearchField.tsx";
import { SolidButton } from "../../components/ui/SolidButton.tsx";
import { useLocale } from "../../i18n/Locale.tsx";
import type { ModelRecord } from "../../catalog-engine/spec.ts";
import "./admin.css";

interface Draft {
  prompt: string;
  completion: string;
  unit: string;
}

function rowKey(model: Pick<ModelRecord, "vendor" | "id">): string {
  return `${model.vendor}/${model.id}`;
}

function draftOf(model: ModelRecord): Draft {
  return {
    prompt: model.pricing.prompt?.cny_per_million != null ? String(model.pricing.prompt.cny_per_million) : "",
    completion: model.pricing.completion?.cny_per_million != null ? String(model.pricing.completion.cny_per_million) : "",
    unit: model.pricing.image?.cny_per_unit != null
      ? String(model.pricing.image.cny_per_unit)
      : model.pricing.second?.cny_per_unit != null
        ? String(model.pricing.second.cny_per_unit)
        : "",
  };
}

function sameDraft(left: Draft, right: Draft): boolean {
  return left.prompt === right.prompt && left.completion === right.completion && left.unit === right.unit;
}

function emptyDraft(): Draft {
  return { prompt: "", completion: "", unit: "" };
}

export function PricingRulesPage(): ReactNode {
  const { locale, copy } = useLocale();
  const a = copy.admin;
  const models = useMemo(() => listModels(), []);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(models.map((model) => [rowKey(model), draftOf(model)])),
  );
  const [saved, setSaved] = useState("");
  const [savedKey, setSavedKey] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return models;
    }
    return models.filter((model) =>
      `${modelLabel(model, locale)} ${vendorLabel(model.vendor, locale)} ${model.id}`.toLowerCase().includes(needle),
    );
  }, [locale, models, query]);

  const dirtyCount = models.reduce((count, model) => {
    const key = rowKey(model);
    const draft = drafts[key] ?? draftOf(model);
    return sameDraft(draft, draftOf(model)) ? count : count + 1;
  }, 0);

  function patch(key: string, field: keyof Draft, value: string): void {
    setDrafts((current) => {
      const prev = current[key] ?? emptyDraft();
      return { ...current, [key]: { ...prev, [field]: value } };
    });
    setSaved("");
    setSavedKey("");
  }

  function commit(key: string): void {
    setSaved(a.saved);
    setSavedKey(key);
  }

  function onCellKey(key: string, event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      commit(key);
    }
  }

  return (
    <PageFrame>
      <PageHeader eyebrow={a.priceEyebrow} title={a.priceTitle} description={a.priceIntro} />
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
        <span className={dirtyCount > 0 ? "admin-price-note is-dirty admin-mono" : "admin-price-note admin-mono"}>
          {copy.shelf.count(visible.length)}
          {dirtyCount > 0 ? ` · ${dirtyCount}` : null}
        </span>
        {saved ? <span className="admin-price-note">{saved}</span> : null}
      </div>
      {visible.length === 0 ? <div className="admin-empty">{copy.shelf.none}</div> : null}
      <div className={view === "grid" ? "admin-price-grid" : "admin-price-list"}>
        {view === "list" && visible.length > 0 ? (
          <div className="admin-price-head">
            <span />
            <span />
            <span>{copy.detail.item}</span>
            <span>{a.input}</span>
            <span>{a.output}</span>
            <span />
          </div>
        ) : null}
        {visible.map((model, index) => {
          const key = rowKey(model);
          const draft = drafts[key] ?? draftOf(model);
          const token = model.pricing.unit === "token";
          const dirty = !sameDraft(draft, draftOf(model));
          const rowClass = [
            "admin-price-row",
            dirty ? "is-dirty" : "",
            savedKey === key ? "is-saved" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const fields = token ? (
            <>
              <label className="admin-price-field">
                <span>{a.input}</span>
                <input
                  inputMode="decimal"
                  autoComplete="off"
                  value={draft.prompt}
                  onChange={(event) => patch(key, "prompt", event.target.value)}
                  onKeyDown={(event) => onCellKey(key, event)}
                />
              </label>
              <label className="admin-price-field">
                <span>{a.output}</span>
                <input
                  inputMode="decimal"
                  autoComplete="off"
                  value={draft.completion}
                  onChange={(event) => patch(key, "completion", event.target.value)}
                  onKeyDown={(event) => onCellKey(key, event)}
                />
              </label>
            </>
          ) : (
            <>
              {view === "list" ? <div className="admin-price-skip" /> : null}
              <label className="admin-price-field">
                <span>{a.unit}</span>
                <input
                  inputMode="decimal"
                  autoComplete="off"
                  value={draft.unit}
                  onChange={(event) => patch(key, "unit", event.target.value)}
                  onKeyDown={(event) => onCellKey(key, event)}
                />
              </label>
            </>
          );
          return (
            <article key={key} className={rowClass}>
              <span className="admin-price-idx admin-mono">{String(index + 1).padStart(2, "0")}</span>
              <VendorMark vendor={model.vendor} />
              <div className="admin-price-id">
                <strong>{modelLabel(model, locale)}</strong>
                <small>
                  {vendorLabel(model.vendor, locale)} · {model.vendor_model}
                </small>
              </div>
              {view === "grid" ? <div className="admin-price-fields">{fields}</div> : fields}
              <SolidButton className="admin-price-save" disabled={!dirty} onClick={() => commit(key)}>
                {savedKey === key ? a.saved : a.save}
              </SolidButton>
            </article>
          );
        })}
      </div>
    </PageFrame>
  );
}
