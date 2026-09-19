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

export function KeysGuidePage(): ReactNode {
  const zh = useDocsLocale() === "zh";

  return (
    <>
      <DocsH1>{zh ? "密钥" : "API keys"}</DocsH1>
      <DocsLead>
        {zh ? (
          <>
            北向是产品密钥：<DocsCode>Authorization: Bearer &lt;MYRIAD_KEY&gt;</DocsCode>
            。南向是厂商 Secret。两套东西，不要混。签发值形如 <DocsCode>sk-myriad-…</DocsCode>
            ，明文只在创建或重置时出现一次。
          </>
        ) : (
          <>
            Northbound uses a product key: <DocsCode>Authorization: Bearer &lt;MYRIAD_KEY&gt;</DocsCode>
            . Southbound uses vendor secrets. Do not mix them. Issued values look like{" "}
            <DocsCode>sk-myriad-…</DocsCode>. Plaintext appears once, on create or rotate.
          </>
        )}
      </DocsLead>

      <DocsTable
        headers={["", zh ? "产品密钥" : "Product key", zh ? "南向 Secret" : "Southbound secret"]}
        rows={[
          [
            zh ? "谁用" : "Who",
            zh ? "你的客户端 → 万象" : "Your client → Myriad",
            zh ? "万象 Worker → 厂商" : "Myriad Worker → vendor",
          ],
          [
            zh ? "哪来" : "Where from",
            zh ? "控制台 Keys" : "Console → Keys",
            zh ? "Worker Secrets（.dev.vars，不进 git）" : "Worker Secrets (.dev.vars, never git)",
          ],
          [
            zh ? "怎么存" : "Stored as",
            zh ? "哈希进 MYRIAD_KEYS KV" : "Hash in MYRIAD_KEYS KV",
            zh ? "仅 Worker 可见" : "Visible only to the Worker",
          ],
          [
            zh ? "请求里" : "On the wire",
            "Authorization: Bearer …",
            zh ? "客户端永远不带" : "Never sent by the client",
          ],
        ]}
      />

      <DocsH2>{zh ? "签发" : "Issue"}</DocsH2>
      <DocsP>
        {zh ? (
          <>
            打开{" "}
            <Link to="/keys" style={{ color: accentColor }}>
              控制台 → API Keys
            </Link>
            。创建时要 <DocsCode>tag</DocsCode>。把返回里的 <DocsCode>secret</DocsCode>{" "}
            立刻存进环境变量。之后列表只有 <DocsCode>prefix</DocsCode> / <DocsCode>last4</DocsCode> /{" "}
            <DocsCode>status</DocsCode>。
          </>
        ) : (
          <>
            Open{" "}
            <Link to="/keys" style={{ color: accentColor }}>
              Console → API Keys
            </Link>
            . Create requires a <DocsCode>tag</DocsCode>. Store <DocsCode>secret</DocsCode> from the
            response immediately. Later lists only show <DocsCode>prefix</DocsCode> /{" "}
            <DocsCode>last4</DocsCode> / <DocsCode>status</DocsCode>.
          </>
        )}
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
// secret ${zh ? "只在这一次响应里" : "only appears in this response"}`,
          },
        ]}
      />

      <DocsH2>{zh ? "管理" : "Manage"}</DocsH2>
      <DocsTable
        headers={zh ? ["动作", "路径"] : ["Action", "Path"]}
        rows={[
          [zh ? "列表（无明文）" : "List (no plaintext)", <DocsCode key="l">GET /v1/keys</DocsCode>],
          [zh ? "创建" : "Create", <DocsCode key="c">POST /v1/keys</DocsCode>],
          [zh ? "改标签 / 停用" : "Retag / disable", <DocsCode key="p">PATCH /v1/keys/:id</DocsCode>],
          [zh ? "重置明文" : "Rotate", <DocsCode key="r">POST /v1/keys/:id/rotate</DocsCode>],
          [zh ? "删除" : "Delete", <DocsCode key="d">DELETE /v1/keys/:id</DocsCode>],
        ]}
      />
      <DocsP>
        {zh ? (
          <>
            没带、假密钥、或已 <DocsCode>disabled</DocsCode>，一律{" "}
            <DocsCode>401 unauthorized</DocsCode>。种子 <DocsCode>dev-key</DocsCode>{" "}
            仅本地；生产必须用控制台签发的 Key。没绑{" "}
            <DocsCode>MYRIAD_KEYS</DocsCode> 时走进程内存储，重启会丢。
          </>
        ) : (
          <>
            Missing, fake, or <DocsCode>disabled</DocsCode> keys all return{" "}
            <DocsCode>401 unauthorized</DocsCode>. The seed <DocsCode>dev-key</DocsCode> is
            local-only; production uses a console-issued key. Without{" "}
            <DocsCode>MYRIAD_KEYS</DocsCode> the store is in-process and dies on restart.
          </>
        )}
      </DocsP>

      <DocsCallout title={zh ? "502 不是换 Key" : "502 is not a new key"}>
        {zh ? (
          <>
            南向挂了查 <DocsCode>.dev.vars</DocsCode>，不是再签一把产品密钥。见{" "}
            <DocsInlink slug="errors">错误码</DocsInlink>。
          </>
        ) : (
          <>
            If the southbound side is down, check <DocsCode>.dev.vars</DocsCode>. Do not mint another
            product key. See <DocsInlink slug="errors">Errors</DocsInlink>.
          </>
        )}
      </DocsCallout>
      <DocsPager current="keys" />
    </>
  );
}
