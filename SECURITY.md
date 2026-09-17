# 安全

- 南向厂商 Key 只放 Worker Secrets / 本地 `.dev.vars`。
- 北向产品密钥哈希存储，明文只在创建或重置时回一次。
- 请不要在 Issue、PR、截图里贴真实密钥。

怀疑泄露：立刻在控制台重置或删除该 Key，并轮换对应的 `wrangler secret`。
