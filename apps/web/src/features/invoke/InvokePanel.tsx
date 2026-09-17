import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button.tsx";
import { TextArea } from "../../components/ui/input.tsx";
import { invokeCapability } from "../../lib/api.ts";
import { borderColor, errorColor, surfaceBg, textSecondary } from "../../tokens/theme.ts";

const panelStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 13,
  color: textSecondary,
};

const preStyle: CSSProperties = {
  margin: 0,
  padding: 12,
  background: surfaceBg,
  border: `1px solid ${borderColor}`,
  borderRadius: 6,
  overflow: "auto",
  fontSize: 13,
};

const errorStyle: CSSProperties = {
  ...preStyle,
  color: errorColor,
};

function sampleInput(id: string): string {
  if (id === "chat") {
    return '{\n  "messages": [{ "role": "user", "content": "用一句话介绍万象" }]\n}';
  }
  if (id === "image.generate") {
    return '{\n  "prompt": "一只坐在书堆上的橘猫，水彩"\n}';
  }
  if (id === "video.generate") {
    return '{\n  "prompt": "一只橘猫走过阳光下的窗台"\n}';
  }
  if (id === "audio.speech") {
    return '{\n  "text": "你好，万象。"\n}';
  }
  return '{\n  "image_url": "https://example.com/a.jpg"\n}';
}

export function InvokePanel({
  apiKey,
  capabilityId,
}: {
  apiKey: string;
  capabilityId: string;
}): ReactNode {
  const [input, setInput] = useState(sampleInput(capabilityId));
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setInput(sampleInput(capabilityId));
    setOutput("");
    setError("");
  }, [capabilityId]);

  async function invoke(): Promise<void> {
    setError("");
    setOutput("");
    setPending(true);
    try {
      const parsed = JSON.parse(input) as unknown;
      const result = await invokeCapability(apiKey, capabilityId, parsed);
      setOutput(JSON.stringify(result, null, 2));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <section style={panelStyle}>
      <label style={labelStyle}>
        输入 JSON
        <TextArea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
          }}
          autoSize={{ minRows: 5, maxRows: 16 }}
        />
      </label>
      <div>
        <Button type="primary" disabled={!capabilityId || pending} loading={pending} onClick={() => void invoke()}>
          调用 {capabilityId || "—"}
        </Button>
      </div>
      {error ? <pre style={errorStyle}>{error}</pre> : null}
      {output ? <pre style={preStyle}>{output}</pre> : null}
    </section>
  );
}
