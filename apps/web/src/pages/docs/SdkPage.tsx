import type { ReactNode } from "react";
import { Link } from "react-router";
import { CodeBlock } from "../../catalog-engine/CodeBlock.tsx";
import { accentColor } from "../../tokens/theme.ts";
import { DocsCallout, DocsCode, DocsH1, DocsH2, DocsLead, DocsP, DocsPager, DocsTable } from "./DocsChrome.tsx";

export function SdkPage(): ReactNode {
  return (
    <>
      <DocsH1>TypeScript SDK</DocsH1>
      <DocsLead>
        <DocsCode>@myriad/sdk</DocsCode> 是北向 HTTP 的薄封装。<DocsCode>createMyriad</DocsCode>{" "}
        之后用 <DocsCode>invoke(id, input)</DocsCode>，不必自己拼路径。它不是 OpenAI SDK 的
        drop-in。
      </DocsLead>

      <DocsH2>安装</DocsH2>
      <DocsP>仓库里是 workspace 包。下游服务只依赖这一层，不要 import <DocsCode>@myriad/gateway</DocsCode>。</DocsP>
      <CodeBlock
        code={`{
  "dependencies": {
    "@myriad/sdk": "workspace:*"
  }
}`}
      />

      <DocsH2>调用</DocsH2>
      <CodeBlock
        code={`import { createMyriad } from "@myriad/sdk";

const myriad = createMyriad({
  baseUrl: "http://127.0.0.1:8791",
  apiKey: process.env.MYRIAD_KEY ?? "dev-key",
});

const reply = await myriad.invoke("chat", {
  messages: [{ role: "user", content: "用一句话介绍万象" }],
});
console.log(reply.output.message.content);

const image = await myriad.invoke("image.generate", {
  prompt: "一辆停在湿沥青上的红色自行车",
  refs: [{ kind: "image", uri: "https://example.com/ref.png" }],
});

const video = await myriad.invoke("video.generate", {
  prompt: "晨雾里的山路，镜头缓慢前推",
});

const speech = await myriad.invoke("audio.speech", {
  text: "你好，这里是万象。",
});`}
      />
      <DocsP>
        这是 <DocsCode>POST /v1/capabilities/:id</DocsCode>，body 为{" "}
        <DocsCode>{`{ input }`}</DocsCode>。第三参 <DocsCode>{"{ channel }"}</DocsCode>{" "}
        只调试。<DocsCode>baseUrl</DocsCode> 不要尾斜杠。浏览器里可设成当前站点，走 Vite 的{" "}
        <DocsCode>/v1</DocsCode> 代理。
      </DocsP>

      <DocsH2>表面</DocsH2>
      <DocsTable
        headers={["方法", "对应"]}
        rows={[
          [<DocsCode key="inv">invoke(id, input)</DocsCode>, "POST /v1/capabilities/:id"],
          [<DocsCode key="lc">listCapabilities()</DocsCode>, "GET /v1/capabilities"],
          [<DocsCode key="gc">getCapability(id)</DocsCode>, "GET /v1/capabilities/:id"],
          [<DocsCode key="h">health()</DocsCode>, "GET /health"],
          [<DocsCode key="lk">listKeys()</DocsCode>, "GET /v1/keys。列表无明文"],
          [<DocsCode key="ck">{"createKey({ tag })"}</DocsCode>, "POST /v1/keys。secret 只回一次"],
          [<DocsCode key="rk">rotateKey(id)</DocsCode>, "POST /v1/keys/:id/rotate"],
          [<DocsCode key="uk">updateKey(id, …)</DocsCode>, "PATCH /v1/keys/:id"],
          [<DocsCode key="dk">deleteKey(id)</DocsCode>, "DELETE /v1/keys/:id"],
        ]}
      />

      <DocsH2>错误</DocsH2>
      <DocsP>
        非 2xx 抛 <DocsCode>MyriadClientError</DocsCode>：<DocsCode>status</DocsCode>、
        <DocsCode>code</DocsCode>、<DocsCode>requestId</DocsCode>。
      </DocsP>
      <CodeBlock
        code={`import { createMyriad, MyriadClientError } from "@myriad/sdk";

try {
  await myriad.invoke("chat", { messages: [] });
} catch (error) {
  if (error instanceof MyriadClientError) {
    console.error(error.status, error.code, error.requestId, error.message);
  }
}`}
      />
      <DocsCallout title="不要">
        <DocsCode>invoke</DocsCode> 不接收模型名。不要给每个 checkpoint 写一个类。厂商差异停在网关南向。
      </DocsCallout>
      <DocsP>
        状态码见{" "}
        <Link to="/docs/errors" style={{ color: accentColor }}>
          Errors
        </Link>
        。HTTP 信封见{" "}
        <Link to="/docs/api" style={{ color: accentColor }}>
          API
        </Link>
        。
      </DocsP>
      <DocsPager current="/docs/sdk" />
    </>
  );
}
