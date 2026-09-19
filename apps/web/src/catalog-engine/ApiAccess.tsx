import { CloseOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { SolidButton } from "../components/ui/SolidButton.tsx";
import { publicBaseUrl } from "../features/keys/origins.ts";
import { TokenPicker } from "../features/keys/TokenPicker.tsx";
import { useProductKeys } from "../features/keys/useProductKeys.ts";
import { useLocale } from "../i18n/Locale.tsx";
import { invokeCapability } from "../lib/api.ts";
import { buildCurl, requestPath, sampleInput } from "./api-spec.ts";
import { CodeBlock } from "./CodeBlock.tsx";
import type { ModelRecord } from "./spec.ts";

export function ApiAccess({
  model,
  open,
  onClose,
}: {
  model: ModelRecord;
  open: boolean;
  onClose: () => void;
}): ReactNode {
  const { copy } = useLocale();
  const { keys, selectedId, secret, setSelectedId, captureSecret } = useProductKeys();
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const baseUrl = publicBaseUrl();
  const path = requestPath(model.capability);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const input = useMemo(() => sampleInput(model.kind), [model.kind]);
  const curl = buildCurl({
    origin,
    path,
    token: secret || "$MYRIAD_KEY",
    input,
    comment: `${model.vendor}/${model.id} · ${model.vendor_model}`,
  });

  if (!open) {
    return null;
  }

  async function runTest(): Promise<void> {
    if (!secret) {
      return;
    }
    setError("");
    setResult("");
    setPending(true);
    try {
      const body = await invokeCapability(secret, model.capability, input);
      setResult(JSON.stringify(body, null, 2));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="api-layer">
      <button type="button" className="api-scrim" aria-label={copy.detail.closeDrawer} onClick={onClose} />
      <aside className="api-drawer" role="dialog" aria-modal="true" aria-labelledby="api-drawer-title">
        <header className="api-drawer-head">
          <h2 id="api-drawer-title">{copy.detail.apiDrawer}</h2>
          <button type="button" className="api-drawer-x" onClick={onClose} aria-label={copy.detail.closeDrawer}>
            <CloseOutlined />
          </button>
        </header>
        <section className="api-step">
          <h3>{copy.detail.stepKey}</h3>
          <p>{copy.detail.stepKeyHint}</p>
          <TokenPicker
            keys={keys}
            value={selectedId}
            secret={secret}
            onChange={(id) => {
              setSelectedId(id);
              setResult("");
              setError("");
            }}
            onSecret={(id, value) => {
              captureSecret(id, value);
              setError("");
            }}
          />
        </section>
        <section className="api-step">
          <h3>{copy.detail.stepCall}</h3>
          <dl className="api-facts">
            <div>
              <dt>{copy.detail.baseUrl}</dt>
              <dd>
                <code>{baseUrl}</code>
              </dd>
            </div>
            <div>
              <dt>{copy.detail.frequency}</dt>
              <dd>
                <code>POST {path}</code>
              </dd>
            </div>
          </dl>
          <CodeBlock code={curl} />
          <div className="try-actions">
            <SolidButton disabled={pending || !secret} onClick={() => void runTest()}>
              {pending ? "…" : copy.api.run}
            </SolidButton>
          </div>
          {error ? <pre className="try-error">{error}</pre> : null}
          {result ? <CodeBlock code={result} /> : null}
        </section>
      </aside>
    </div>
  );
}
