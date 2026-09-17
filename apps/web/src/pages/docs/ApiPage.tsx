import type { ReactNode } from "react";
import { Link } from "react-router";
import { CodeBlock } from "../../catalog-engine/CodeBlock.tsx";
import { accentColor } from "../../tokens/theme.ts";
import { DocsCallout, DocsCode, DocsH1, DocsH2, DocsLead, DocsP, DocsPager, DocsTable } from "./DocsChrome.tsx";

const curl = `curl -sS http://127.0.0.1:8791/v1/capabilities/chat \\
  -H "Authorization: Bearer $MYRIAD_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input":{"messages":[{"role":"user","content":"用一句话介绍万象"}]}}'`;

const fetchCode = `const res = await fetch("http://127.0.0.1:8791/v1/capabilities/chat", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.MYRIAD_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    input: { messages: [{ role: "user", content: "用一句话介绍万象" }] },
  }),
});
const body = await res.json();`;

const curlImage = `curl -sS http://127.0.0.1:8791/v1/capabilities/image.generate \\
  -H "Authorization: Bearer $MYRIAD_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": {
      "prompt": "一辆停在湿沥青上的红色自行车",
      "refs": [{ "kind": "image", "uri": "https://example.com/ref.png" }]
    }
  }'`;

export function ApiPage(): ReactNode {
  return (
    <>
      <DocsH1>API</DocsH1>
      <DocsLead>
        写入路径永远是 <DocsCode>POST /v1/capabilities/:id</DocsCode>。<DocsCode>id</DocsCode>{" "}
        是能力，不是厂商模型名。
      </DocsLead>

      <DocsH2>基址与鉴权</DocsH2>
      <DocsTable
        headers={["", ""]}
        rows={[
          ["网关", <DocsCode key="g">http://127.0.0.1:8791</DocsCode>],
          [
            "控制台",
            <Link key="c" to="/home" style={{ color: accentColor }}>
              http://127.0.0.1:18081
            </Link>,
          ],
          ["鉴权", <DocsCode key="a">Authorization: Bearer $MYRIAD_KEY</DocsCode>],
        ]}
      />

      <DocsH2>请求</DocsH2>
      <DocsTable
        headers={["字段", "位置", "说明"]}
        rows={[
          [<DocsCode key="id">:id</DocsCode>, "path", "能力 id，例如 chat、image.generate。"],
          [<DocsCode key="auth">Authorization</DocsCode>, "header", "Bearer 产品密钥。必填。"],
          [<DocsCode key="ct">Content-Type</DocsCode>, "header", "application/json。"],
          [
            <DocsCode key="rid">x-request-id</DocsCode>,
            "header",
            "自带则回显；不带由网关生成。",
          ],
          [<DocsCode key="input">input</DocsCode>, "body", "该能力的入参。合同写法是包这一层。"],
          [
            <DocsCode key="ch">channel</DocsCode>,
            "body",
            "仅调试。生产路由不认客户端指定的渠道。",
          ],
        ]}
      />
      <DocsP>
        没有 <DocsCode>input</DocsCode> 键时，整段 body 当 input。对外仍按包一层写。
      </DocsP>
      <CodeBlock
        tabs={[
          { label: "curl", value: "curl", code: curl },
          { label: "fetch", value: "fetch", code: fetchCode },
        ]}
      />

      <DocsH2>响应</DocsH2>
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
        <DocsCode>channel</DocsCode> 是实际出站。<DocsCode>usage.unit</DocsCode> 为{" "}
        <DocsCode>token</DocsCode> / <DocsCode>image</DocsCode> / <DocsCode>audio_second</DocsCode> /{" "}
        <DocsCode>video_second</DocsCode> / <DocsCode>request</DocsCode>。响应头里也有{" "}
        <DocsCode>x-request-id</DocsCode>。
      </DocsP>

      <DocsH2>已接通的能力</DocsH2>
      <DocsTable
        headers={[":id", "input", "output"]}
        rows={[
          [
            <DocsCode key="c">chat</DocsCode>,
            "messages 必填；tools、stream 可选",
            "message",
          ],
          [
            <DocsCode key="i">image.generate</DocsCode>,
            "prompt 必填；refs 最多 16 张，有则图生图",
            "images[]",
          ],
          [
            <DocsCode key="v">video.generate</DocsCode>,
            "prompt 必填；refs、duration_s 可选",
            "job_id + status（先回 queued）",
          ],
          [<DocsCode key="a">audio.speech</DocsCode>, "text 必填；voice 可选", "audio"],
          [
            <DocsCode key="n">image-nsfw</DocsCode>,
            "input（文本或 { kind, uri }）；labels 可选",
            "labels[{ label, score }]",
          ],
          [<DocsCode key="p">portrait-quality</DocsCode>, "input（文本或介质）", "value"],
          [
            <DocsCode key="k">calorie-recognize</DocsCode>,
            <>
              source + task（卡路里用 <DocsCode>detect</DocsCode>）
            </>,
            "instances[]",
          ],
        ]}
      />
      <CodeBlock code={curlImage} />

      <DocsH2>只读接口</DocsH2>
      <DocsTable
        headers={["方法", "路径", "说明"]}
        rows={[
          ["GET", <DocsCode key="h">/health</DocsCode>, "探活。不鉴权。"],
          ["GET", <DocsCode key="lc">/v1/capabilities</DocsCode>, "当前产品能打的能力。要 Bearer。"],
          ["GET", <DocsCode key="gc">/v1/capabilities/:id</DocsCode>, "单条能力。要 Bearer。"],
        ]}
      />

      <DocsCallout title="流式与异步">
        <DocsCode>chat</DocsCode> 可带 <DocsCode>input.stream</DocsCode>
        。当前网关仍回一条 JSON，不是 SSE。<DocsCode>video.generate</DocsCode> 是 job，先回{" "}
        <DocsCode>{`{ job_id, status: "queued" }`}</DocsCode>，不要当同步成片。
      </DocsCallout>

      <DocsCallout title="不要找这些路径">
        <DocsCode>/v1/models</DocsCode>、<DocsCode>/v1/chat/completions</DocsCode>{" "}
        不在万象北向。打过去是 404。
      </DocsCallout>

      <DocsP>
        错误形状见{" "}
        <Link to="/docs/errors" style={{ color: accentColor }}>
          Errors
        </Link>
        。密钥见{" "}
        <Link to="/docs/keys" style={{ color: accentColor }}>
          API keys
        </Link>
        。
      </DocsP>
      <DocsPager current="/docs/api" />
    </>
  );
}
