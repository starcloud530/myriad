import type { ReactNode } from "react";
import { Link } from "react-router";
import { CodeBlock } from "../../catalog-engine/CodeBlock.tsx";
import { accentColor } from "../../tokens/theme.ts";
import { DocsCallout, DocsCode, DocsH1, DocsH2, DocsLead, DocsP, DocsPager, DocsTable } from "./DocsChrome.tsx";

const curlChat = `export MYRIAD_KEY=dev-key

curl -sS http://127.0.0.1:8791/v1/capabilities/chat \\
  -H "Authorization: Bearer $MYRIAD_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": {
      "messages": [{ "role": "user", "content": "用一句话介绍万象" }]
    }
  }'`;

const curlImage = `curl -sS http://127.0.0.1:8791/v1/capabilities/image.generate \\
  -H "Authorization: Bearer $MYRIAD_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "input": { "prompt": "一辆停在湿沥青上的红色自行车" } }'`;

const fetchChat = `const response = await fetch("http://127.0.0.1:8791/v1/capabilities/chat", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.MYRIAD_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    input: {
      messages: [{ role: "user", content: "用一句话介绍万象" }],
    },
  }),
});`;

const sdkChat = `import { createMyriad } from "@myriad/sdk";

const myriad = createMyriad({
  baseUrl: "http://127.0.0.1:8791",
  apiKey: process.env.MYRIAD_KEY ?? "dev-key",
});

const reply = await myriad.invoke("chat", {
  messages: [{ role: "user", content: "用一句话介绍万象" }],
});

console.log(reply.output.message.content);`;

export function QuickstartPage(): ReactNode {
  return (
    <>
      <DocsH1>Quickstart</DocsH1>
      <DocsLead>
        万象是一条能力 API：<DocsCode>POST /v1/capabilities/:id</DocsCode>
        ，带产品密钥。网关选渠道。没有 <DocsCode>/v1/models</DocsCode>，也没有{" "}
        <DocsCode>/v1/chat/completions</DocsCode>。
      </DocsLead>

      <DocsH2>三种用法</DocsH2>
      <DocsTable
        headers={["方式", "怎么走"]}
        rows={[
          ["HTTP", "任意语言。直接 POST 网关，零依赖。"],
          [
            <Link key="sdk" to="/docs/sdk" style={{ color: accentColor }}>
              TypeScript SDK
            </Link>,
            <span key="sdk-desc">
              <DocsCode>createMyriad</DocsCode> 之后 <DocsCode>invoke(id, input)</DocsCode>
            </span>,
          ],
          [
            <Link key="console" to="/keys" style={{ color: accentColor }}>
              Console
            </Link>,
            "签发密钥、看货架、在广场试跑。",
          ],
        ]}
      />

      <DocsCallout title="本地">
        网关 <DocsCode>http://127.0.0.1:8791</DocsCode>。控制台与文档{" "}
        <DocsCode>http://127.0.0.1:18081</DocsCode>。没有密钥时先用种子{" "}
        <DocsCode>dev-key</DocsCode>，或到{" "}
        <Link to="/keys" style={{ color: accentColor }}>
          Keys
        </Link>{" "}
        签发。
      </DocsCallout>

      <DocsH2>第一次请求</DocsH2>
      <DocsP>
        路径上的 <DocsCode>:id</DocsCode> 是能力。请求体包一层{" "}
        <DocsCode>input</DocsCode>。SDK 把第二个参数放进这层。
      </DocsP>
      <CodeBlock
        tabs={[
          { label: "curl", value: "curl", code: curlChat },
          { label: "fetch", value: "fetch", code: fetchChat },
          { label: "TypeScript", value: "ts", code: sdkChat },
        ]}
      />
      <DocsP>同一条路径换 id 即可打图像、视频、语音：</DocsP>
      <CodeBlock code={curlImage} />
      <DocsP>
        成功信封是 <DocsCode>request_id</DocsCode>、<DocsCode>capability</DocsCode>、
        <DocsCode>kind</DocsCode>、<DocsCode>channel</DocsCode>、<DocsCode>output</DocsCode>、
        <DocsCode>usage</DocsCode>。<DocsCode>channel</DocsCode> 是实际出站，不是你指定的结果。
      </DocsP>

      <DocsCallout title="没有 OpenAI 兼容层">
        不要把 OpenAI SDK 的 <DocsCode>baseURL</DocsCode> 指过来。Chat 主路 DeepSeek，失败回落
        Qwen。下游不用选模型。
      </DocsCallout>

      <DocsH2>本地跑起来</DocsH2>
      <CodeBlock
        code={`git clone https://github.com/starcloud530/myriad.git
cd myriad
npm install
# 南向厂商 Key 放到 packages/gateway/.dev.vars，不要入库
npm run dev          # 网关 :8791
npm run dev:web      # 控制台与文档 :18081`}
      />

      <DocsH2>下一步</DocsH2>
      <DocsP>
        HTTP 合同 →{" "}
        <Link to="/docs/api" style={{ color: accentColor }}>
          API
        </Link>
        。客户端 →{" "}
        <Link to="/docs/sdk" style={{ color: accentColor }}>
          TypeScript SDK
        </Link>
        。签发密钥 →{" "}
        <Link to="/docs/keys" style={{ color: accentColor }}>
          API keys
        </Link>
        。
      </DocsP>
      <DocsPager current="/docs/quickstart" />
    </>
  );
}
