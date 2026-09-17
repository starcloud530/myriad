import { Button, Input, Typography } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { invokeCapability } from "../../lib/api.ts";
import { borderColor, errorColor, surfaceBg, textSecondary } from "../../tokens/theme.ts";
import type { ModelRecord } from "../../catalog-engine/spec.ts";

const thread: CSSProperties = {
  display: "grid",
  gap: 12,
  maxWidth: 720,
};

const bubble: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${borderColor}`,
  background: surfaceBg,
  whiteSpace: "pre-wrap",
};

function latencyOf(started: number): string {
  return `${Math.round(performance.now() - started)} ms`;
}

function assistantText(body: unknown): string {
  if (body == null || typeof body !== "object") {
    return JSON.stringify(body, null, 2);
  }
  const output = (body as { output?: { message?: { content?: unknown } } }).output;
  const content = output?.message?.content;
  if (typeof content === "string") {
    return content;
  }
  return JSON.stringify(body, null, 2);
}

function imageUris(body: unknown): string[] {
  if (body == null || typeof body !== "object") {
    return [];
  }
  const images = (body as { output?: { images?: Array<{ uri?: string }> } }).output?.images;
  if (!Array.isArray(images)) {
    return [];
  }
  return images.map((item) => item.uri).filter((uri): uri is string => typeof uri === "string" && uri.length > 0);
}

export function TryPlay({
  apiKey,
  model,
}: {
  apiKey: string;
  model: ModelRecord;
}): ReactNode {
  if (!apiKey) {
    return <Typography.Text type="secondary">Select a key, or create one under Keys.</Typography.Text>;
  }
  if (model.kind === "chat") {
    return <ChatPlay apiKey={apiKey} capabilityId={model.capability} />;
  }
  if (model.kind === "generate.image") {
    return <ImagePlay apiKey={apiKey} capabilityId={model.capability} />;
  }
  if (model.kind === "generate.audio") {
    return <SimplePlay apiKey={apiKey} capabilityId={model.capability} field="text" placeholder="Sentence to speak" sample="Hello from Myriad." />;
  }
  if (model.kind === "generate.video") {
    return <SimplePlay apiKey={apiKey} capabilityId={model.capability} field="prompt" placeholder="Video prompt" sample="An orange cat walking past a sunlit window" />;
  }
  return <SimplePlay apiKey={apiKey} capabilityId={model.capability} field="input" placeholder="Text or JSON" sample="Try Myriad" />;
}

function ChatPlay({ apiKey, capabilityId }: { apiKey: string; capabilityId: string }): ReactNode {
  const [draft, setDraft] = useState("Introduce Myriad in one sentence.");
  const [rows, setRows] = useState<Array<{ role: "user" | "assistant"; text: string; latency?: string }>>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function send(): Promise<void> {
    const text = draft.trim();
    if (!text) {
      return;
    }
    const next = [...rows, { role: "user" as const, text }];
    setRows(next);
    setDraft("");
    setError("");
    setPending(true);
    const started = performance.now();
    try {
      const body = await invokeCapability(apiKey, capabilityId, {
        messages: next.filter((row) => row.role === "user" || row.role === "assistant").map((row) => ({
          role: row.role,
          content: row.text,
        })),
      });
      setRows([...next, { role: "assistant", text: assistantText(body), latency: latencyOf(started) }]);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={thread}>
      {rows.map((row, index) => (
        <div key={`${row.role}-${index}`} style={{ ...bubble, marginLeft: row.role === "assistant" ? 0 : 48 }}>
          <Typography.Text type="secondary">{row.role === "user" ? "You" : "Assistant"}</Typography.Text>
          {row.latency ? (
            <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
              {row.latency}
            </Typography.Text>
          ) : null}
          <div>{row.text}</div>
        </div>
      ))}
      {error ? <pre style={{ margin: 0, color: errorColor, whiteSpace: "pre-wrap" }}>{error}</pre> : null}
      <Input.TextArea
        value={draft}
        autoSize={{ minRows: 2, maxRows: 6 }}
        placeholder="Type a message"
        onChange={(event) => {
          setDraft(event.target.value);
        }}
        onPressEnter={(event) => {
          if (!event.shiftKey) {
            event.preventDefault();
            void send();
          }
        }}
      />
      <div>
        <Button type="primary" loading={pending} onClick={() => void send()}>
          Send
        </Button>
      </div>
    </div>
  );
}

function ImagePlay({ apiKey, capabilityId }: { apiKey: string; capabilityId: string }): ReactNode {
  const [prompt, setPrompt] = useState("An orange cat sitting on a stack of books, watercolor");
  const [uris, setUris] = useState<string[]>([]);
  const [latency, setLatency] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function run(): Promise<void> {
    setError("");
    setUris([]);
    setPending(true);
    const started = performance.now();
    try {
      const body = await invokeCapability(apiKey, capabilityId, { prompt });
      setUris(imageUris(body));
      setLatency(latencyOf(started));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={thread}>
      <Input.TextArea
        value={prompt}
        autoSize={{ minRows: 2, maxRows: 6 }}
        onChange={(event) => {
          setPrompt(event.target.value);
        }}
      />
      <div>
        <Button type="primary" loading={pending} onClick={() => void run()}>
          Generate
        </Button>
        {latency ? (
          <Typography.Text type="secondary" style={{ marginLeft: 12 }}>
            {latency}
          </Typography.Text>
        ) : null}
      </div>
      {error ? <pre style={{ margin: 0, color: errorColor, whiteSpace: "pre-wrap" }}>{error}</pre> : null}
      {uris.map((uri) => (
        <img key={uri} src={uri} alt="" style={{ maxWidth: 480, borderRadius: 8, border: `1px solid ${borderColor}` }} />
      ))}
    </div>
  );
}

function SimplePlay({
  apiKey,
  capabilityId,
  field,
  placeholder,
  sample,
}: {
  apiKey: string;
  capabilityId: string;
  field: string;
  placeholder: string;
  sample: string;
}): ReactNode {
  const [value, setValue] = useState(sample);
  const [output, setOutput] = useState("");
  const [latency, setLatency] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function run(): Promise<void> {
    setError("");
    setOutput("");
    setPending(true);
    const started = performance.now();
    try {
      const input = field === "input" ? value : { [field]: value };
      const body = await invokeCapability(apiKey, capabilityId, input);
      setOutput(JSON.stringify(body, null, 2));
      setLatency(latencyOf(started));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={thread}>
      <Input.TextArea
        value={value}
        autoSize={{ minRows: 2, maxRows: 6 }}
        placeholder={placeholder}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
      <div>
        <Button type="primary" loading={pending} onClick={() => void run()}>
          Run
        </Button>
        {latency ? (
          <Typography.Text type="secondary" style={{ marginLeft: 12 }}>
            {latency}
          </Typography.Text>
        ) : null}
      </div>
      {error ? <pre style={{ margin: 0, color: errorColor, whiteSpace: "pre-wrap" }}>{error}</pre> : null}
      {output ? (
        <pre style={{ ...bubble, margin: 0, overflow: "auto", color: textSecondary }}>{output}</pre>
      ) : null}
    </div>
  );
}
