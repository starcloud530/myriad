# TypeScript SDK

给**其他 TS 服务**用的包。画布、OPC、评测脚本都装这一层。

包名：`@myriad/sdk`  
路径：`packages/sdk`  
不要依赖 `@myriad/gateway`。

## 安装（本仓库 workspace）

```bash
npm install
```

业务包的 `package.json`：

```json
{
  "dependencies": {
    "@myriad/sdk": "*"
  }
}
```

发布到 npm 之前，本地用 workspace 链接即可。`apps/cli` 已经这样接。

## 最小用法

```ts
import { createMyriad } from "@myriad/sdk";

const myriad = createMyriad({
  baseUrl: process.env.MYRIAD_URL ?? "http://127.0.0.1:8791",
  apiKey: process.env.MYRIAD_KEY ?? "dev-key",
});

const chat = await myriad.invoke("chat", {
  messages: [{ role: "user", content: "用一句话介绍万象" }],
});
// chat.output.message.content 有类型

const image = await myriad.invoke("image.generate", {
  prompt: "一只坐在书堆上的橘猫，水彩",
});
```

图生图把 `refs` 带上，合同还是 `image.generate`：

```ts
await myriad.invoke("image.generate", {
  prompt: "把背景改成夜晚的书房",
  refs: [{ kind: "image", uri: "https://example.com/ref.png" }],
});
```

## 还会用到的方法

```ts
await myriad.health();
await myriad.listCapabilities();
await myriad.getCapability("chat");

const created = await myriad.createKey({ tag: "评测", description: "内部" });
// created.secret 只在这一次出现
await myriad.deleteKey(created.id);
```

## 错误

```ts
import { MyriadClientError } from "@myriad/sdk";

try {
  await myriad.invoke("chat", { messages: [] });
} catch (error) {
  if (error instanceof MyriadClientError) {
    console.error(error.status, error.code, error.requestId);
  }
}
```

## 设计边界

- 入参按能力泛型钉死，没有 `generate(any)`。
- 不为 `deepseek-flash` 再建一个类。型号是货架，调用是能力。
- `fetch` 可注入，方便测和边缘运行时。

更多 payload：[examples.md](examples.md)。
