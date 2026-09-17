# `@myriad/sdk`

万象 TypeScript 客户端。其他服务只装这一包。

完整教程：[docs/sdk.md](../../docs/sdk.md)

```ts
import { createMyriad } from "@myriad/sdk";

const myriad = createMyriad({
  baseUrl: "http://127.0.0.1:8791",
  apiKey: process.env.MYRIAD_KEY ?? "dev-key",
});

const reply = await myriad.invoke("chat", {
  messages: [{ role: "user", content: "用一句话介绍万象" }],
});
```
