import { Input, Typography } from "antd";
import type { ReactNode } from "react";
import { useState } from "react";
import { SolidButton } from "../../components/ui/SolidButton.tsx";
import { invokeCapability } from "../../lib/api.ts";
import { borderColor } from "../../tokens/theme.ts";
import type { ModelRecord } from "../../catalog-engine/spec.ts";

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
    <div className="try-stage">
      <div className="chat-log">
        {rows.length === 0 ? (
          <div className="try-empty">Type a message. Enter to send, Shift+Enter for a new line.</div>
        ) : null}
        {rows.map((row, index) => (
          <div key={`${row.role}-${index}`} className={row.role === "user" ? "chat-bubble is-user" : "chat-bubble"}>
            <div className="chat-meta">
              {row.role === "user" ? "You" : "Assistant"}
              {row.latency ? ` · ${row.latency}` : ""}
            </div>
            <div>{row.text}</div>
          </div>
        ))}
        {error ? <pre className="try-error">{error}</pre> : null}
      </div>
      <div className="chat-composer">
        <Input.TextArea
          value={draft}
          autoSize={{ minRows: 3, maxRows: 8 }}
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
        <SolidButton disabled={pending} onClick={() => void send()}>
          {pending ? "…" : "Send"}
        </SolidButton>
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
    <div className="try-split">
      <div className="try-col">
        <Input.TextArea
          value={prompt}
          autoSize={{ minRows: 10, maxRows: 18 }}
          onChange={(event) => {
            setPrompt(event.target.value);
          }}
        />
        <div className="try-actions">
          <SolidButton disabled={pending} onClick={() => void run()}>
            {pending ? "…" : "Generate"}
          </SolidButton>
          {latency ? <span className="chat-meta">{latency}</span> : null}
        </div>
        {error ? <pre className="try-error">{error}</pre> : null}
      </div>
      <div className="try-preview">
        {uris.length === 0 ? <div className="try-empty">Generated images land here.</div> : null}
        {uris.map((uri) => (
          <img key={uri} src={uri} alt="" style={{ width: "100%", borderRadius: 8, border: `1px solid ${borderColor}` }} />
        ))}
      </div>
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
    <div className="try-split">
      <div className="try-col">
        <Input.TextArea
          value={value}
          autoSize={{ minRows: 10, maxRows: 18 }}
          placeholder={placeholder}
          onChange={(event) => {
            setValue(event.target.value);
          }}
        />
        <div className="try-actions">
          <SolidButton disabled={pending} onClick={() => void run()}>
            {pending ? "…" : "Run"}
          </SolidButton>
          {latency ? <span className="chat-meta">{latency}</span> : null}
        </div>
        {error ? <pre className="try-error">{error}</pre> : null}
      </div>
      <pre className="try-preview try-output">{output || "Response JSON lands here."}</pre>
    </div>
  );
}
