import { Button, Segmented, Steps, Typography } from "antd";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { PublicCapability } from "../features/capability/types.ts";
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
    <div style={{ display: "grid", gap: 28, maxWidth: 820 }}>
      <Steps size="small" current={step} items={[{ title: "选择 Token" }, { title: "选择接口" }]} />

      <section style={{ display: "grid", gap: 10 }}>
        <Typography.Text strong>1. Token</Typography.Text>
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

      <section style={{ display: "grid", gap: 10, opacity: secret ? 1 : 0.45, pointerEvents: secret ? "auto" : "none" }}>
        <Typography.Text strong>2. 测试接口</Typography.Text>
        <Typography.Text type="secondary" style={{ color: textSecondary }}>
          POST {path}
        </Typography.Text>
        <Segmented
          block
          value={endpoint?.id}
          options={endpoints.map((item) => ({ label: item.label, value: item.id }))}
          onChange={(value) => {
            setEndpointId(String(value));
            setResult("");
            setError("");
          }}
        />
      </section>

      {endpoint ? (
        <section style={{ display: "grid", gap: 12 }}>
          <CodeBlock code={curl} />
          <div>
            <Button type="primary" loading={pending} disabled={!endpoint.runnable || !secret} onClick={() => void runTest()}>
              测试
            </Button>
            {!endpoint.runnable ? (
              <Typography.Text type="secondary" style={{ marginLeft: 12 }}>
                这个合同本期没有渠道。
              </Typography.Text>
            ) : null}
          </div>
          {error ? (
            <pre style={{ margin: 0, color: errorColor, whiteSpace: "pre-wrap" }}>{error}</pre>
          ) : null}
          {result ? <CodeBlock code={result} /> : null}
        </section>
      ) : null}
    </div>
  );
}
