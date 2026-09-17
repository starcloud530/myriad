import { Typography } from "antd";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { FilterTrack } from "../components/ui/FilterTrack.tsx";
import { SolidButton } from "../components/ui/SolidButton.tsx";
import { StepRail } from "../components/ui/StepRail.tsx";
import type { PublicCapability } from "../features/capability/types.ts";
import { useLocale } from "../i18n/Locale.tsx";
import { TokenPicker } from "../features/keys/TokenPicker.tsx";
import { useProductKeys } from "../features/keys/useProductKeys.ts";
import { invokeCapability } from "../lib/api.ts";
import { errorColor, textSecondary } from "../tokens/theme.ts";
import { buildCurl, requestPath, testEndpoints } from "./api-spec.ts";
import { CodeBlock } from "./CodeBlock.tsx";
import type { ModelRecord } from "./spec.ts";

export function CapabilityApiDocs({
  model,
}: {
  model: ModelRecord;
  capability?: PublicCapability | null;
}): ReactNode {
  const { copy } = useLocale();
  const { keys, selectedId, secret, setSelectedId, captureSecret } = useProductKeys();
  const endpoints = useMemo(() => testEndpoints(model), [model]);
  const [endpointId, setEndpointId] = useState(endpoints[0]?.id ?? "");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const endpoint = endpoints.find((row) => row.id === endpointId) ?? endpoints[0];
  const step = secret ? 1 : 0;
  const path = requestPath(model.capability);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const curl = endpoint
    ? buildCurl({
        origin,
        path,
        token: secret || "$MYRIAD_KEY",
        input: endpoint.input,
        comment: `${model.vendor}/${model.id} · ${endpoint.label} · ${model.vendor_model}`,
      })
    : "";

  async function runTest(): Promise<void> {
    if (!secret || !endpoint?.runnable) {
      return;
    }
    setError("");
    setResult("");
    setPending(true);
    try {
      const body = await invokeCapability(secret, model.capability, endpoint.input);
      setResult(JSON.stringify(body, null, 2));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="api-split">
      <aside className="pane api-rail">
        <StepRail current={step} steps={[copy.api.pickKey, copy.api.pickApi]} />
        <section className="api-block">
          <div className="pane-kicker">1. {copy.api.key}</div>
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
        <section className="api-block" style={{ opacity: secret ? 1 : 0.45, pointerEvents: secret ? "auto" : "none" }}>
          <div className="pane-kicker">2. {copy.api.test}</div>
          <Typography.Text type="secondary" style={{ color: textSecondary }}>
            POST {path}
          </Typography.Text>
          <FilterTrack
            value={endpoint?.id ?? ""}
            options={endpoints.map((item) => ({ label: item.label, value: item.id }))}
            onChange={(value) => {
              setEndpointId(value);
              setResult("");
              setError("");
            }}
          />
          {endpoint ? (
            <div className="try-actions">
              <SolidButton disabled={pending || !endpoint.runnable || !secret} onClick={() => void runTest()}>
                {pending ? "…" : copy.api.run}
              </SolidButton>
              {!endpoint.runnable ? (
                <span className="chat-meta">{copy.api.closed}</span>
              ) : null}
            </div>
          ) : null}
        </section>
      </aside>
      <div className="api-main">
        {endpoint ? <CodeBlock code={curl} /> : null}
        {error ? <pre style={{ margin: 0, color: errorColor, whiteSpace: "pre-wrap" }}>{error}</pre> : null}
        {result ? <CodeBlock code={result} /> : <div className="try-empty">Run the request. The envelope lands here.</div>}
      </div>
    </div>
  );
}
