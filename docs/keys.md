# 密钥

两套钥匙，不要混。细则见 [信息存储/鉴权托管.md](信息存储/鉴权托管.md)。

## 北向：给你的服务

控制台 **API Keys** 或：

```bash
curl -sS http://127.0.0.1:8791/v1/keys \
  -H "Authorization: Bearer dev-key" \
  -H "Content-Type: application/json" \
  -d "{\"tag\":\"评测\",\"description\":\"内部试跑\"}"
```

```ts
const key = await myriad.createKey({ tag: "评测" });
process.env.MYRIAD_KEY = key.secret; // 立刻存起来，界面不再回显
```

- 哈希进 `MYRIAD_KEYS` KV，明文不落盘。
- 系统种子 `dev-key` 不能删、不能重置。
- 随便编的 `sk-myriad-…` 会 401，这是闭环，不是演戏。

业务环境变量只放 `MYRIAD_KEY` / `MYRIAD_URL`。

## 南向：只给网关

`DEEPSEEK_API_KEY` 等四把。本地 `.dev.vars`，上线 `wrangler secret put`。  
yaml、D1、前端、`@myriad/sdk` 都碰不到值。
