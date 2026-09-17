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

function samples(hello: string, prompt: string): { chat: string; image: string; fetch: string; sdk: string } {
  return {
    chat: `export MYRIAD_KEY=dev-key

curl -sS http://127.0.0.1:8791/v1/capabilities/chat \\
  -H "Authorization: Bearer $MYRIAD_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": {
      "messages": [{ "role": "user", "content": "${hello}" }]
    }
  }'`,
    image: `curl -sS http://127.0.0.1:8791/v1/capabilities/image.generate \\
  -H "Authorization: Bearer $MYRIAD_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "input": { "prompt": "${prompt}" } }'`,
    fetch: `const response = await fetch("http://127.0.0.1:8791/v1/capabilities/chat", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.MYRIAD_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    input: {
      messages: [{ role: "user", content: "${hello}" }],
    },
  }),
});`,
    sdk: `import { createMyriad } from "@myriad/sdk";

const myriad = createMyriad({
  baseUrl: "http://127.0.0.1:8791",
  apiKey: process.env.MYRIAD_KEY ?? "dev-key",
});

const reply = await myriad.invoke("chat", {
  messages: [{ role: "user", content: "${hello}" }],
});

console.log(reply.output.message.content);`,
  };
}

export function QuickstartPage(): ReactNode {
  const locale = useDocsLocale();
  const zh = locale === "zh";
  const code = samples(
    zh ? "用一句话介绍万象" : "Introduce Myriad in one sentence.",
    zh ? "一辆停在湿沥青上的红色自行车" : "A red bicycle on wet asphalt",
  );

  return (
    <>
      <DocsH1>{zh ? "快速开始" : "Quickstart"}</DocsH1>
      <DocsLead>
        {zh ? (
          <>
            万象是一条能力 API：<DocsCode>POST /v1/capabilities/:id</DocsCode>
            ，带产品密钥。网关选渠道。没有 <DocsCode>/v1/models</DocsCode>，也没有{" "}
            <DocsCode>/v1/chat/completions</DocsCode>。
          </>
        ) : (
          <>
            Myriad is one capability API: <DocsCode>POST /v1/capabilities/:id</DocsCode> with a
            product key. The gateway picks the channel. There is no <DocsCode>/v1/models</DocsCode>{" "}
            and no <DocsCode>/v1/chat/completions</DocsCode>.
          </>
        )}
      </DocsLead>

      <DocsH2>{zh ? "三种用法" : "Three ways in"}</DocsH2>
      <DocsTable
        headers={zh ? ["方式", "怎么走"] : ["Approach", "Use it when"]}
        rows={[
          ["HTTP", zh ? "任意语言。直接 POST 网关，零依赖。" : "Any language. POST the gateway. No SDK."],
          [
            <DocsInlink key="sdk" slug="sdk">
              TypeScript SDK
            </DocsInlink>,
            <span key="sdk-desc">
              <DocsCode>createMyriad</DocsCode>
              {zh ? " 之后 " : " then "}
              <DocsCode>invoke(id, input)</DocsCode>
            </span>,
          ],
          [
            <Link key="console" to="/keys" style={{ color: accentColor }}>
              {zh ? "控制台" : "Console"}
            </Link>,
            zh ? "签发密钥、浏览模型、在线试跑。" : "Issue keys, browse models, try a capability.",
          ],
        ]}
      />

      <DocsCallout title={zh ? "本地" : "Local"}>
        {zh ? "网关" : "Gateway"} <DocsCode>http://127.0.0.1:8791</DocsCode>
        {zh ? "。控制台与文档 " : ". Console and docs "}
        <DocsCode>http://127.0.0.1:18081</DocsCode>
        {zh ? "。没有密钥时先用种子 " : ". No key yet? Use the seed "}
        <DocsCode>dev-key</DocsCode>
        {zh ? "，或到 " : ", or issue one at "}
        <Link to="/keys" style={{ color: accentColor }}>
          Keys
        </Link>
        {zh ? " 签发。" : "."}
      </DocsCallout>

      <DocsH2>{zh ? "第一次请求" : "First request"}</DocsH2>
      <DocsP>
        {zh ? (
          <>
            路径上的 <DocsCode>:id</DocsCode> 是能力。请求体包一层 <DocsCode>input</DocsCode>
            。SDK 把第二个参数放进这层。
          </>
        ) : (
          <>
            <DocsCode>:id</DocsCode> is the capability. Wrap the payload in <DocsCode>input</DocsCode>
            . The SDK puts the second argument there.
          </>
        )}
      </DocsP>
      <CodeBlock
        tabs={[
          { label: "curl", value: "curl", code: code.chat },
          { label: "fetch", value: "fetch", code: code.fetch },
          { label: "TypeScript", value: "ts", code: code.sdk },
        ]}
      />
      <DocsP>
        {zh
          ? "同一条路径换 id 即可打图像、视频、语音："
          : "Same path, different id, for image, video, and speech:"}
      </DocsP>
      <CodeBlock code={code.image} />
      <DocsP>
        {zh ? (
          <>
            成功信封是 <DocsCode>request_id</DocsCode>、<DocsCode>capability</DocsCode>、
            <DocsCode>kind</DocsCode>、<DocsCode>channel</DocsCode>、<DocsCode>output</DocsCode>、
            <DocsCode>usage</DocsCode>。<DocsCode>channel</DocsCode> 是实际出站，不是你指定的结果。
          </>
        ) : (
          <>
            A success envelope has <DocsCode>request_id</DocsCode>, <DocsCode>capability</DocsCode>,{" "}
            <DocsCode>kind</DocsCode>, <DocsCode>channel</DocsCode>, <DocsCode>output</DocsCode>,{" "}
            <DocsCode>usage</DocsCode>. <DocsCode>channel</DocsCode> is what actually went outbound,
            not a client override.
          </>
        )}
      </DocsP>

      <DocsCallout title={zh ? "没有 OpenAI 兼容层" : "No OpenAI compatibility layer"}>
        {zh ? (
          <>
            不要把 OpenAI SDK 的 <DocsCode>baseURL</DocsCode> 指过来。Chat 主路 DeepSeek，失败回落
            Qwen。应用不用指定厂商。
          </>
        ) : (
          <>
            Do not point an OpenAI SDK <DocsCode>baseURL</DocsCode> at Myriad. Chat uses DeepSeek
            first, Qwen on fallback. Your app does not pick the vendor.
          </>
        )}
      </DocsCallout>

      <DocsH2>{zh ? "本地跑起来" : "Run it locally"}</DocsH2>
      <CodeBlock
        code={
          zh
            ? `git clone https://github.com/starcloud530/myriad.git
cd myriad
npm install
# 南向厂商 Key 放到 packages/gateway/.dev.vars，不要入库
npm run dev          # 网关 :8791
npm run dev:web      # 控制台与文档 :18081`
            : `git clone https://github.com/starcloud530/myriad.git
cd myriad
npm install
# Southbound vendor keys → packages/gateway/.dev.vars (never commit)
npm run dev          # gateway :8791
npm run dev:web      # console + docs :18081`
        }
      />

      <DocsH2>{zh ? "下一步" : "Next"}</DocsH2>
      <DocsP>
        {zh ? (
          <>
            接口说明 → <DocsInlink slug="api">API</DocsInlink>。客户端 →{" "}
            <DocsInlink slug="sdk">TypeScript SDK</DocsInlink>。签发密钥 →{" "}
            <DocsInlink slug="keys">密钥</DocsInlink>。
          </>
        ) : (
          <>
            HTTP contract → <DocsInlink slug="api">API</DocsInlink>. Client →{" "}
            <DocsInlink slug="sdk">TypeScript SDK</DocsInlink>. Issue a key →{" "}
            <DocsInlink slug="keys">API keys</DocsInlink>.
          </>
        )}
      </DocsP>
      <DocsPager current="quickstart" />
    </>
  );
}
