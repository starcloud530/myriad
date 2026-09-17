import type { ReactNode } from "react";
import { CodeBlock } from "../../catalog-engine/CodeBlock.tsx";
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

export function SdkPage(): ReactNode {
  const zh = useDocsLocale() === "zh";
  const hello = zh ? "用一句话介绍万象" : "Introduce Myriad in one sentence.";
  const prompt = zh ? "一辆停在湿沥青上的红色自行车" : "A red bicycle on wet asphalt";
  const video = zh ? "晨雾里的山路，镜头缓慢前推" : "A mountain road in morning fog, slow push-in";
  const speech = zh ? "你好，这里是万象。" : "Hello from Myriad.";

  return (
    <>
      <DocsH1>TypeScript SDK</DocsH1>
      <DocsLead>
        {zh ? (
          <>
            <DocsCode>@myriad/sdk</DocsCode> 是北向 HTTP 的薄封装。<DocsCode>createMyriad</DocsCode>{" "}
            之后用 <DocsCode>invoke(id, input)</DocsCode>，不必自己拼路径。它不是 OpenAI SDK 的
            drop-in。
          </>
        ) : (
          <>
            <DocsCode>@myriad/sdk</DocsCode> is a thin northbound client. After{" "}
            <DocsCode>createMyriad</DocsCode>, call <DocsCode>invoke(id, input)</DocsCode>. It is not
            an OpenAI SDK drop-in.
          </>
        )}
      </DocsLead>

      <DocsH2>{zh ? "安装" : "Install"}</DocsH2>
      <DocsP>
        {zh ? (
          <>
            仓库里以 workspace 包提供。应用只依赖这一层，不要 import <DocsCode>@myriad/gateway</DocsCode>。
          </>
        ) : (
          <>
            It is a workspace package in this repo. Applications depend on this layer only. Do
            not import <DocsCode>@myriad/gateway</DocsCode>.
          </>
        )}
      </DocsP>
      <CodeBlock
        code={`{
  "dependencies": {
    "@myriad/sdk": "workspace:*"
  }
}`}
      />

      <DocsH2>{zh ? "调用" : "Call"}</DocsH2>
      <CodeBlock
        code={`import { createMyriad } from "@myriad/sdk";

const myriad = createMyriad({
  baseUrl: "http://127.0.0.1:8791",
  apiKey: process.env.MYRIAD_KEY ?? "dev-key",
});

const reply = await myriad.invoke("chat", {
  messages: [{ role: "user", content: "${hello}" }],
});
console.log(reply.output.message.content);

const image = await myriad.invoke("image.generate", {
  prompt: "${prompt}",
  refs: [{ kind: "image", uri: "https://example.com/ref.png" }],
});

const video = await myriad.invoke("video.generate", {
  prompt: "${video}",
});

const speech = await myriad.invoke("audio.speech", {
  text: "${speech}",
});`}
      />
      <DocsP>
        {zh ? (
          <>
            这是 <DocsCode>POST /v1/capabilities/:id</DocsCode>，body 为{" "}
            <DocsCode>{`{ input }`}</DocsCode>。第三参 <DocsCode>{"{ channel }"}</DocsCode>{" "}
            只调试。<DocsCode>baseUrl</DocsCode> 不要尾斜杠。浏览器里可设成当前站点，走 Vite 的{" "}
            <DocsCode>/v1</DocsCode> 代理。
          </>
        ) : (
          <>
            This is <DocsCode>POST /v1/capabilities/:id</DocsCode> with body{" "}
            <DocsCode>{`{ input }`}</DocsCode>. A third argument <DocsCode>{"{ channel }"}</DocsCode>{" "}
            is debug-only. Do not trail-slash <DocsCode>baseUrl</DocsCode>. In the browser you can
            point it at the current origin and use the Vite <DocsCode>/v1</DocsCode> proxy.
          </>
        )}
      </DocsP>

      <DocsH2>{zh ? "表面" : "Surface"}</DocsH2>
      <DocsTable
        headers={zh ? ["方法", "对应"] : ["Method", "Maps to"]}
        rows={[
          [<DocsCode key="inv">invoke(id, input)</DocsCode>, "POST /v1/capabilities/:id"],
          [<DocsCode key="lc">listCapabilities()</DocsCode>, "GET /v1/capabilities"],
          [<DocsCode key="gc">getCapability(id)</DocsCode>, "GET /v1/capabilities/:id"],
          [<DocsCode key="h">health()</DocsCode>, "GET /health"],
          [
            <DocsCode key="lk">listKeys()</DocsCode>,
            zh ? "GET /v1/keys。列表无明文" : "GET /v1/keys. No plaintext in the list.",
          ],
          [
            <DocsCode key="ck">{"createKey({ tag })"}</DocsCode>,
            zh ? "POST /v1/keys。secret 只回一次" : "POST /v1/keys. secret is returned once.",
          ],
          [<DocsCode key="rk">rotateKey(id)</DocsCode>, "POST /v1/keys/:id/rotate"],
          [<DocsCode key="uk">updateKey(id, …)</DocsCode>, "PATCH /v1/keys/:id"],
          [<DocsCode key="dk">deleteKey(id)</DocsCode>, "DELETE /v1/keys/:id"],
        ]}
      />

      <DocsH2>{zh ? "错误" : "Errors"}</DocsH2>
      <DocsP>
        {zh ? (
          <>
            非 2xx 抛 <DocsCode>MyriadClientError</DocsCode>：<DocsCode>status</DocsCode>、
            <DocsCode>code</DocsCode>、<DocsCode>requestId</DocsCode>。
          </>
        ) : (
          <>
            Non-2xx throws <DocsCode>MyriadClientError</DocsCode> with <DocsCode>status</DocsCode>,{" "}
            <DocsCode>code</DocsCode>, <DocsCode>requestId</DocsCode>.
          </>
        )}
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
      <DocsCallout title={zh ? "不要" : "Don't"}>
        {zh ? (
          <>
            <DocsCode>invoke</DocsCode> 不接收模型名。不要给每个 checkpoint 写一个类。厂商差异停在网关南向。
          </>
        ) : (
          <>
            <DocsCode>invoke</DocsCode> does not take a model name. Do not invent a class per
            checkpoint. Vendor differences stop at the southbound gateway.
          </>
        )}
      </DocsCallout>
      <DocsP>
        {zh ? (
          <>
            状态码见 <DocsInlink slug="errors">错误码</DocsInlink>。HTTP 信封见{" "}
            <DocsInlink slug="api">API</DocsInlink>。
          </>
        ) : (
          <>
            Status codes: <DocsInlink slug="errors">Errors</DocsInlink>. Envelope:{" "}
            <DocsInlink slug="api">API</DocsInlink>.
          </>
        )}
      </DocsP>
      <DocsPager current="sdk" />
    </>
  );
}
