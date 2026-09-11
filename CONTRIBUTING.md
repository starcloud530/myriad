# 参与万象

源码只放在 `myriad/`。仓库根目录放构建、部署和 GitHub 必要文件。

## 约定

- 能力是一等公民，模型只是渠道实现。
- 新能力：在 `myriad/domain/ids.ts` 加常量，在 `myriad/catalog/seed.ts` 登记，必要时加适配器。
- 新适配器实现 `ChannelAdapter`，并在 `createDefaultDeps` 里注册。
- 配置读多写少，放 catalog；计数不要写 KV；账本只追加。
- 对外列表必须去掉 `channel.config`。

## 检查

```bash
npm run typecheck
```

提交前至少通过类型检查。
