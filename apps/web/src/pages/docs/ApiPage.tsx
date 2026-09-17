import type { ReactNode } from "react";
import { Link } from "react-router";
import { CodeBlock } from "../../catalog-engine/CodeBlock.tsx";
import { accentColor } from "../../tokens/theme.ts";
import {
  DocsCallout,
  DocsCode,
  DocsH1,
  DocsH2,
  DocsInlink,
  DocsLead,
  DocsP,
  DocsPager,
  DocsTable,
} from "./DocsChrome.tsx";
import { useDocsLocale } from "./DocsLocale.tsx";

export function ApiPage(): ReactNode {
  const zh = useDocsLocale() === "zh";
  const hello = zh ? "用一句话介绍万象" : "Introduce Myriad in one sentence.";
  const prompt = zh ? "一辆停在湿沥青上的红色自行车" : "A red bicycle on wet asphalt";

  return (
    <>
      <DocsH1>API</DocsH1>
      <DocsLead>
        {zh ? (
          <>
            写入路径永远是 <DocsCode>POST /v1/capabilities/:id</DocsCode>。<DocsCode>id</DocsCode>{" "}
            是能力，不是厂商模型名。
          </>
        ) : (
          <>
            The write path is always <DocsCode>POST /v1/capabilities/:id</DocsCode>.{" "}
            <DocsCode>id</DocsCode> is a capability, not a vendor model name.
          </>
        )}
      </DocsLead>

      <DocsH2>{zh ? "基址与鉴权" : "Base URL and auth"}</DocsH2>
      <DocsTable
        headers={["", ""]}
        rows={[
          [zh ? "网关" : "Gateway", <DocsCode key="g">http://127.0.0.1:8791</DocsCode>],
          [
            zh ? "控制台" : "Console",
            <Link key="c" to="/home" style={{ color: accentColor }}>
              http://127.0.0.1:18081
            </Link>,
          ],
          [zh ? "鉴权" : "Auth", <DocsCode key="a">Authorization: Bearer $MYRIAD_KEY</DocsCode>],
        ]}
      />

      <DocsH2>{zh ? "请求" : "Request"}</DocsH2>
      <DocsTable
        headers={zh ? ["字段", "位置", "说明"] : ["Field", "Where", "Meaning"]}
        rows={[
          [
            <DocsCode key="id">:id</DocsCode>,
            "path",
            zh ? "能力 id，例如 chat、image.generate。" : "Capability id, e.g. chat, image.generate.",
          ],
          [
            <DocsCode key="auth">Authorization</DocsCode>,
            "header",
            zh ? "Bearer 产品密钥。必填。" : "Bearer product key. Required.",
          ],
          [<DocsCode key="ct">Content-Type</DocsCode>, "header", "application/json."],
          [
            <DocsCode key="rid">x-request-id</DocsCode>,
            "header",
            zh ? "自带则回显；不带由网关生成。" : "Echoed if sent; otherwise the gateway mints one.",
          ],
          [
            <DocsCode key="input">input</DocsCode>,
            "body",
            zh ? "该能力的入参，包在这一层。" : "Capability input. Wrap it in this field.",
          ],
          [
            <DocsCode key="ch">channel</DocsCode>,
            "body",
            zh ? "仅调试。生产路由不认客户端指定的渠道。" : "Debug only. Production routing ignores a client-picked channel.",
          ],
        ]}
      />
      <DocsP>
        {zh ? (
          <>
            没有 <DocsCode>input</DocsCode> 键时，整段 body 当 input。对外仍按包一层写。
          </>
        ) : (
          <>
            If there is no <DocsCode>input</DocsCode> key, the whole body is treated as input. Still
            write the wrapped form in public clients.
          </>
        )}
      </DocsP>
      <CodeBlock
        tabs={[
          {
            label: "curl",
            value: "curl",
            code: `curl -sS http://127.0.0.1:8791/v1/capabilities/chat \\
  -H "Authorization: Bearer $MYRIAD_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input":{"messages":[{"role":"user","content":"${hello}"}]}}'`,
          },
          {
            label: "fetch",
            value: "fetch",
            code: `const res = await fetch("http://127.0.0.1:8791/v1/capabilities/chat", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.MYRIAD_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    input: { messages: [{ role: "user", content: "${hello}" }] },
  }),
});
const body = await res.json();`,
          },
        ]}
      />

      <DocsH2>{zh ? "响应" : "Response"}</DocsH2>
      <CodeBlock
        code={`{
  "request_id": "…",
  "capability": "chat",
  "kind": "chat",
  "channel": "deepseek",
  "output": { "message": { "role": "assistant", "content": "…" } },
  "usage": { "units": 1, "unit": "token" }
}`}
      />
      <DocsP>
        {zh ? (
          <>
            <DocsCode>channel</DocsCode> 是实际出站。<DocsCode>usage.unit</DocsCode> 为{" "}
            <DocsCode>token</DocsCode> / <DocsCode>image</DocsCode> / <DocsCode>audio_second</DocsCode> /{" "}
            <DocsCode>video_second</DocsCode> / <DocsCode>request</DocsCode>。响应头里也有{" "}
            <DocsCode>x-request-id</DocsCode>。
          </>
        ) : (
          <>
            <DocsCode>channel</DocsCode> is the outbound channel. <DocsCode>usage.unit</DocsCode> is{" "}
            <DocsCode>token</DocsCode> / <DocsCode>image</DocsCode> / <DocsCode>audio_second</DocsCode> /{" "}
            <DocsCode>video_second</DocsCode> / <DocsCode>request</DocsCode>. The response also
            carries <DocsCode>x-request-id</DocsCode>.
          </>
        )}
      </DocsP>

      <DocsH2>{zh ? "已接通的能力" : "Live capabilities"}</DocsH2>
      <DocsTable
        headers={[":id", "input", "output"]}
        rows={[
          [
            <DocsCode key="c">chat</DocsCode>,
            zh ? "messages 必填；tools、stream 可选" : "messages required; tools, stream optional",
            "message",
          ],
          [
            <DocsCode key="i">image.generate</DocsCode>,
            zh ? "prompt 必填；refs 最多 16 张，有则图生图" : "prompt required; refs (max 16) switches to edit",
            "images[]",
          ],
          [
            <DocsCode key="v">video.generate</DocsCode>,
            zh ? "prompt 必填；refs、duration_s 可选" : "prompt required; refs, duration_s optional",
            zh ? "job_id + status（先回 queued）" : "job_id + status (starts queued)",
          ],
          [
            <DocsCode key="a">audio.speech</DocsCode>,
            zh ? "text 必填；voice 可选" : "text required; voice optional",
            "audio",
          ],
          [
            <DocsCode key="n">image-nsfw</DocsCode>,
            zh ? "input（文本或 { kind, uri }）；labels 可选" : "input (text or { kind, uri }); labels optional",
            "labels[{ label, score }]",
          ],
          [
            <DocsCode key="p">portrait-quality</DocsCode>,
            zh ? "input（文本或介质）" : "input (text or media)",
            "value",
          ],
          [
            <DocsCode key="k">calorie-recognize</DocsCode>,
            <>
              source + task{zh ? "（卡路里用 " : " (calories use "}
              <DocsCode>detect</DocsCode>
              {zh ? "）" : ")"}
            </>,
            "instances[]",
          ],
        ]}
      />
      <CodeBlock
        code={`curl -sS http://127.0.0.1:8791/v1/capabilities/image.generate \\
  -H "Authorization: Bearer $MYRIAD_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": {
      "prompt": "${prompt}",
      "refs": [{ "kind": "image", "uri": "https://example.com/ref.png" }]
    }
  }'`}
      />

      <DocsH2>{zh ? "只读接口" : "Read-only"}</DocsH2>
      <DocsTable
        headers={zh ? ["方法", "路径", "说明"] : ["Method", "Path", "Notes"]}
        rows={[
          ["GET", <DocsCode key="h">/health</DocsCode>, zh ? "探活。不鉴权。" : "Liveness. No auth."],
          [
            "GET",
            <DocsCode key="lc">/v1/capabilities</DocsCode>,
            zh ? "当前产品能打的能力。要 Bearer。" : "Capabilities for this product. Bearer required.",
          ],
          [
            "GET",
            <DocsCode key="gc">/v1/capabilities/:id</DocsCode>,
            zh ? "单条能力。要 Bearer。" : "One capability. Bearer required.",
          ],
        ]}
      />

      <DocsCallout title={zh ? "流式与异步" : "Streaming and jobs"}>
        {zh ? (
          <>
            <DocsCode>chat</DocsCode> 可带 <DocsCode>input.stream</DocsCode>
            。当前网关仍回一条 JSON，不是 SSE。<DocsCode>video.generate</DocsCode> 是 job，先回{" "}
            <DocsCode>{`{ job_id, status: "queued" }`}</DocsCode>，不要当同步成片。
          </>
        ) : (
          <>
            <DocsCode>chat</DocsCode> accepts <DocsCode>input.stream</DocsCode>. The gateway still
            returns one JSON body, not SSE. <DocsCode>video.generate</DocsCode> is a job: first
            response is <DocsCode>{`{ job_id, status: "queued" }`}</DocsCode>, not a finished clip.
          </>
        )}
      </DocsCallout>

      <DocsCallout title={zh ? "不要找这些路径" : "These paths are not here"}>
        <DocsCode>/v1/models</DocsCode>
        {zh ? "、" : " and "}
        <DocsCode>/v1/chat/completions</DocsCode>
        {zh ? " 不在万象北向。打过去是 404。" : " are not on the northbound API. They 404."}
      </DocsCallout>

      <DocsP>
        {zh ? (
          <>
            错误形状见 <DocsInlink slug="errors">错误码</DocsInlink>。密钥见{" "}
            <DocsInlink slug="keys">密钥</DocsInlink>。
          </>
        ) : (
          <>
            Error shapes: <DocsInlink slug="errors">Errors</DocsInlink>. Keys:{" "}
            <DocsInlink slug="keys">API keys</DocsInlink>.
          </>
        )}
      </DocsP>
      <DocsPager current="api" />
    </>
  );
}
