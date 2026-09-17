import type { ReactNode } from "react";
import { Link } from "react-router";
import { CodeBlock } from "../../catalog-engine/CodeBlock.tsx";
import { accentColor } from "../../tokens/theme.ts";
import { DocsCallout, DocsCode, DocsH1, DocsH2, DocsLead, DocsP, DocsPager, DocsTable } from "./DocsChrome.tsx";

export function KeysGuidePage(): ReactNode {
  return (
    <>
      <DocsH1>API keys</DocsH1>
      <DocsLead>
        北向是产品密钥：<DocsCode>Authorization: Bearer &lt;MYRIAD_KEY&gt;</DocsCode>
        。南向是厂商 Secret。两套东西，不要混。签发值形如 <DocsCode>sk-myriad-…</DocsCode>
        ，明文只在创建或重置时出现一次。
      </DocsLead>

      <DocsTable
        headers={["", "产品密钥", "南向 Secret"]}
        rows={[
          ["谁用", "你的客户端 → 万象", "万象 Worker → 厂商"],
          ["哪来", "控制台 Keys", "Worker Secrets（.dev.vars，不进 git）"],
          ["怎么存", "哈希进 MYRIAD_KEYS KV", "仅 Worker 可见"],
          ["请求里", "Authorization: Bearer …", "客户端永远不带"],
        ]}
      />

      <DocsH2>签发</DocsH2>
      <DocsP>
        打开{" "}
        <Link to="/keys" style={{ color: accentColor }}>
          Console → API Keys
        </Link>
        。创建时要 <DocsCode>tag</DocsCode>。把返回里的 <DocsCode>secret</DocsCode>{" "}
        立刻存进环境变量。之后列表只有 <DocsCode>prefix</DocsCode> / <DocsCode>last4</DocsCode> /{" "}
        <DocsCode>status</DocsCode>。
      </DocsP>
      <CodeBlock
        tabs={[
          {
            label: "curl",
            value: "curl",
            code: `curl -sS http://127.0.0.1:8791/v1/keys \\
  -H "Authorization: Bearer $MYRIAD_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"tag":"ci","description":"local scripts"}'`,
          },
          {
            label: "SDK",
            value: "sdk",
            code: `const key = await myriad.createKey({ tag: "ci" });
console.log(key.secret);
// secret 只在这一次响应里`,
          },
        ]}
      />

      <DocsH2>管理</DocsH2>
      <DocsTable
        headers={["动作", "路径"]}
        rows={[
          ["列表（无明文）", <DocsCode key="l">GET /v1/keys</DocsCode>],
          ["创建", <DocsCode key="c">POST /v1/keys</DocsCode>],
          ["改标签 / 停用", <DocsCode key="p">PATCH /v1/keys/:id</DocsCode>],
          ["重置明文", <DocsCode key="r">POST /v1/keys/:id/rotate</DocsCode>],
          ["删除", <DocsCode key="d">DELETE /v1/keys/:id</DocsCode>],
        ]}
      />
      <DocsP>
        没带、假密钥、或已 <DocsCode>disabled</DocsCode>，一律{" "}
        <DocsCode>401 unauthorized</DocsCode>。系统种子 <DocsCode>dev-key</DocsCode>{" "}
        不能改、不能轮换、不能删（<DocsCode>403 forbidden</DocsCode>）。没绑{" "}
        <DocsCode>MYRIAD_KEYS</DocsCode> 时走进程内存储，重启会丢。
      </DocsP>

      <DocsCallout title="502 不是换 Key">
        南向挂了查 <DocsCode>.dev.vars</DocsCode>，不是再签一把产品密钥。见{" "}
        <Link to="/docs/errors" style={{ color: accentColor }}>
          Errors
        </Link>
        。
      </DocsCallout>
      <DocsPager current="/docs/keys" />
    </>
  );
}
