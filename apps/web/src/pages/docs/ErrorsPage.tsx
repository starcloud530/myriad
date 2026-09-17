import type { ReactNode } from "react";
import { Link } from "react-router";
import { CodeBlock } from "../../catalog-engine/CodeBlock.tsx";
import { accentColor } from "../../tokens/theme.ts";
import { DocsCallout, DocsCode, DocsH1, DocsH2, DocsLead, DocsP, DocsPager, DocsTable } from "./DocsChrome.tsx";

export function ErrorsPage(): ReactNode {
  return (
    <>
      <DocsH1>Errors</DocsH1>
      <DocsLead>
        失败时返回 JSON 信封，不走厂商原始错误体。记下 <DocsCode>request_id</DocsCode>，再对照{" "}
        <DocsCode>error.code</DocsCode>。响应头里也有 <DocsCode>x-request-id</DocsCode>。SDK
        映射为 <DocsCode>MyriadClientError</DocsCode>。
      </DocsLead>

      <CodeBlock
        code={`{
  "error": {
    "code": "unauthorized",
    "message": "missing or invalid api key"
  },
  "request_id": "…"
}`}
      />

      <DocsH2>状态码</DocsH2>
      <DocsTable
        headers={["HTTP", "code", "何时", "怎么处理"]}
        rows={[
          [
            "400",
            <DocsCode key="b">bad_request</DocsCode>,
            "JSON 坏了，或 input 缺必填（chat.messages、image/video.prompt、audio.text），或 refs 非法。",
            "改 body。路径不用换。",
          ],
          [
            "401",
            <DocsCode key="u">unauthorized</DocsCode>,
            "没带 Authorization，假密钥，或已 disabled。",
            "控制台拿一把 active 的。本地可用种子 dev-key。",
          ],
          [
            "403",
            <DocsCode key="f">forbidden</DocsCode>,
            "当前产品没有这项能力；或改/轮换/删除系统密钥 dev-key。",
            "换已授权的 id。系统密钥不要动。",
          ],
          [
            "404",
            <DocsCode key="n">not_found</DocsCode>,
            "能力未登记，密钥 id 不存在，或打了 /v1/chat/completions。",
            "能力用表里的 id。调用走 POST /v1/capabilities/:id。",
          ],
          [
            "500",
            <DocsCode key="i">internal_error</DocsCode>,
            "未归类的内部错误。",
            "带上 request_id 查日志。",
          ],
          [
            "502",
            <DocsCode key="c">channel_failed</DocsCode>,
            "单条出站渠道失败。",
            "查 Worker Secrets / .dev.vars，不是改北向路径。",
          ],
          [
            "502",
            <DocsCode key="a">all_channels_failed</DocsCode>,
            "主备都失败，或没有可用渠道。invoke 对外多半是这个码。",
            "同上。看 error.message 里最后一次渠道错误。",
          ],
          [
            "503",
            <DocsCode key="d">capability_disabled</DocsCode>,
            "能力已登记但 enabled=false。",
            "换别的 id，或等能力重新打开。",
          ],
        ]}
      />

      <DocsH2>复现</DocsH2>
      <CodeBlock
        tabs={[
          {
            label: "curl",
            value: "curl",
            code: `curl -sS http://127.0.0.1:8791/v1/capabilities/chat \\
  -H "Authorization: Bearer bad-key" \\
  -H "Content-Type: application/json" \\
  -d '{"input":{"messages":[{"role":"user","content":"ping"}]}}'`,
          },
          {
            label: "SDK",
            value: "sdk",
            code: `import { createMyriad, MyriadClientError } from "@myriad/sdk";

try {
  await myriad.invoke("chat", {
    messages: [{ role: "user", content: "ping" }],
  });
} catch (error) {
  if (error instanceof MyriadClientError) {
    console.error(error.status, error.code, error.requestId, error.message);
  }
}`,
          },
        ]}
      />

      <DocsCallout title="没有 OpenAI 那套码">
        没有 <DocsCode>invalid_api_key</DocsCode> / <DocsCode>model_not_found</DocsCode>
        。假密钥是 401，未知能力是 404。能打到 502，说明产品密钥已经过了。
      </DocsCallout>

      <DocsP>
        完整契约在{" "}
        <Link to="/docs/api" style={{ color: accentColor }}>
          API
        </Link>
        。密钥在{" "}
        <Link to="/keys" style={{ color: accentColor }}>
          Console → Keys
        </Link>
        。
      </DocsP>
      <DocsPager current="/docs/errors" />
    </>
  );
}
