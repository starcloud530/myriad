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

export function ErrorsPage(): ReactNode {
  const zh = useDocsLocale() === "zh";

  return (
    <>
      <DocsH1>{zh ? "错误码" : "Errors"}</DocsH1>
      <DocsLead>
        {zh ? (
          <>
            失败时返回 JSON 信封，不走厂商原始错误体。记下 <DocsCode>request_id</DocsCode>，再对照{" "}
            <DocsCode>error.code</DocsCode>。响应头里也有 <DocsCode>x-request-id</DocsCode>。SDK
            映射为 <DocsCode>MyriadClientError</DocsCode>。
          </>
        ) : (
          <>
            Failures return a JSON envelope, not the vendor body. Keep <DocsCode>request_id</DocsCode>{" "}
            and match <DocsCode>error.code</DocsCode>. The header also has{" "}
            <DocsCode>x-request-id</DocsCode>. The SDK maps this to <DocsCode>MyriadClientError</DocsCode>
            .
          </>
        )}
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

      <DocsH2>{zh ? "状态码" : "Status codes"}</DocsH2>
      <DocsTable
        headers={zh ? ["HTTP", "code", "何时", "怎么处理"] : ["HTTP", "code", "When", "What to do"]}
        rows={[
          [
            "400",
            <DocsCode key="b">bad_request</DocsCode>,
            zh
              ? "JSON 坏了，或 input 缺必填（chat.messages、image/video.prompt、audio.text），或 refs 非法。"
              : "Bad JSON, missing required input, or illegal refs.",
            zh ? "改 body。路径不用换。" : "Fix the body. Leave the path.",
          ],
          [
            "401",
            <DocsCode key="u">unauthorized</DocsCode>,
            zh ? "没带 Authorization，假密钥，或已 disabled。" : "Missing Authorization, fake key, or disabled.",
            zh
              ? "控制台登录后签发一把 active Key。dev-key 仅本地。"
              : "Sign in and issue an active key. dev-key is local-only.",
          ],
          [
            "403",
            <DocsCode key="f">forbidden</DocsCode>,
            zh
              ? "当前产品没有这项能力；或改/轮换/删除系统密钥 dev-key。"
              : "This product cannot use the capability, or you tried to mutate the seed key.",
            zh ? "换已授权的 id。系统密钥不要动。" : "Use a granted id. Leave the seed key alone.",
          ],
          [
            "404",
            <DocsCode key="n">not_found</DocsCode>,
            zh
              ? "能力未登记，密钥 id 不存在，或打了 /v1/chat/completions。"
              : "Unknown capability, unknown key id, or /v1/chat/completions.",
            zh
              ? "能力用表里的 id。调用走 POST /v1/capabilities/:id。"
              : "Use an id from the table. Call POST /v1/capabilities/:id.",
          ],
          [
            "500",
            <DocsCode key="i">internal_error</DocsCode>,
            zh ? "未归类的内部错误。" : "Unhandled internal error.",
            zh ? "带上 request_id 查日志。" : "Take request_id to the logs.",
          ],
          [
            "502",
            <DocsCode key="c">channel_failed</DocsCode>,
            zh ? "单条出站渠道失败。" : "One outbound channel failed.",
            zh
              ? "查 Worker Secrets / .dev.vars，不是改北向路径。"
              : "Check Worker Secrets / .dev.vars, not the northbound path.",
          ],
          [
            "502",
            <DocsCode key="a">all_channels_failed</DocsCode>,
            zh
              ? "主备都失败，或没有可用渠道。invoke 对外多半是这个码。"
              : "Primary and fallback both failed, or no channel is available.",
            zh ? "同上。看 error.message 里最后一次渠道错误。" : "Same. Read the last channel error in error.message.",
          ],
          [
            "503",
            <DocsCode key="d">capability_disabled</DocsCode>,
            zh ? "能力已登记但 enabled=false。" : "Capability exists but enabled=false.",
            zh ? "换别的 id，或等能力重新打开。" : "Use another id, or wait until it is enabled.",
          ],
        ]}
      />

      <DocsH2>{zh ? "复现" : "Reproduce"}</DocsH2>
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

      <DocsCallout title={zh ? "没有 OpenAI 那套码" : "Not the OpenAI error codes"}>
        {zh ? (
          <>
            没有 <DocsCode>invalid_api_key</DocsCode> / <DocsCode>model_not_found</DocsCode>
            。假密钥是 401，未知能力是 404。能打到 502，说明产品密钥已经过了。
          </>
        ) : (
          <>
            There is no <DocsCode>invalid_api_key</DocsCode> / <DocsCode>model_not_found</DocsCode>.
            A fake key is 401. An unknown capability is 404. A 502 means the product key already
            passed.
          </>
        )}
      </DocsCallout>

      <DocsP>
        {zh ? (
          <>
            完整契约在 <DocsInlink slug="api">API</DocsInlink>。密钥在{" "}
            <Link to="/keys" style={{ color: accentColor }}>
              控制台 → Keys
            </Link>
            。
          </>
        ) : (
          <>
            Full contract: <DocsInlink slug="api">API</DocsInlink>. Keys:{" "}
            <Link to="/keys" style={{ color: accentColor }}>
              Console → Keys
            </Link>
            .
          </>
        )}
      </DocsP>
      <DocsPager current="errors" />
    </>
  );
}
