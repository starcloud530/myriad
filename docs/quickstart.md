# 快速开始

目标：十分钟内，用万象的产品密钥打通一次对话。

## 1. 安装

```bash
git clone https://github.com/starcloud530/myriad.git
cd myriad
npm install
```

需要 Node 20+。

## 2. 南向密钥（平台自己的厂商 Key）

从开通清单把四把变量拷到 `packages/gateway/.dev.vars`，**不要提交**：

```
DEEPSEEK_API_KEY=
QIANWEN_API_KEY=
FAL_API_KEY=
VOLCENGINE_API_KEY=
```

对照 `packages/gateway/.dev.vars.example`。这些是渠道用的，不是给你业务服务的。

## 3. 启动

```bash
npm run dev          # 网关 http://127.0.0.1:8791
npm run dev:web      # 广场 http://127.0.0.1:18081 ，/v1 代理到网关
```

开发种子密钥：`dev-key`。控制台「API Keys」里新建的钥匙，网关当场认。

## 4. 打一次

curl：

```bash
curl -sS http://127.0.0.1:8791/v1/capabilities/chat \
  -H "Authorization: Bearer dev-key" \
  -H "Content-Type: application/json" \
  -d "{\"input\":{\"messages\":[{\"role\":\"user\",\"content\":\"用一句话介绍万象\"}]}}"
```

CLI（内部已走 `@myriad/sdk`）：

```bash
npm run dev:cli -- invoke chat --input "{\"messages\":[{\"role\":\"user\",\"content\":\"你好\"}]}"
```

自己的 TS 服务：

```ts
import { createMyriad } from "@myriad/sdk";

const myriad = createMyriad({
  baseUrl: "http://127.0.0.1:8791",
  apiKey: "dev-key",
});

const result = await myriad.invoke("chat", {
  messages: [{ role: "user", content: "你好" }],
});
console.log(result.output.message.content);
```

成功会长这样：

```json
{
  "request_id": "…",
  "capability": "chat",
  "kind": "chat",
  "channel": "deepseek",
  "output": { "message": { "role": "assistant", "content": "…" } },
  "usage": { "units": 1, "unit": "token" }
}
```

`channel` 是实际出站。你没有、也不该指定厂商路径。

## 下一步

- 分清名词 → [concepts.md](concepts.md)
- 把 curl 换成自己的服务 → [sdk.md](sdk.md)
- 看齐全部合同 → [http.md](http.md)
