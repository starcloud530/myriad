# 参与万象

先读 [docs/concepts.md](docs/concepts.md)。提 PR 前 `npm run typecheck`。

## 放哪

| 要改的东西 | 位置 |
|---|---|
| 网关、协议、适配器 | `packages/gateway` |
| 给别人装的 TS 客户端 | `packages/sdk` |
| 广场 / 控制台 | `apps/web` |
| CLI | `apps/cli`（只依赖 sdk） |
| 货架文案与标价 | `catalog/models/<vendor>/*.yaml` |
| 给人看的教程 | `docs/` |

- 中台逻辑只放 `packages/gateway`。不要再把 `adapter` / `auth` / `protocol` 升成空 npm 包。
- 应用只通过 HTTP 或 `@myriad/sdk` 调网关，**不要 import 网关内部模块**。
- 新入口加在 `apps/`，不要把 UI 写进网关。

## 协议

合同在 `packages/gateway/src/protocol/`。新服务先对上七族，对不上才加合同，不加第八族。

`packages/sdk/src/types.ts` 是对外复写。改了协议，两边一起改，并补 [docs/http.md](docs/http.md) / [docs/examples.md](docs/examples.md)。

## 新能力

1. `packages/gateway/src/domain/ids.ts` 加常量  
2. `catalog/seed.ts` 登记渠道  
3. sdk `CapabilityInputs` 补类型  
4. `docs/examples.md` 补一条  

## 新适配器

实现 `ChannelAdapter`，在 `createDefaultDeps` 注册。南向 Key 只进 `env`。

## 注释

- 对外 API（sdk、HTTP 信封、协议 input）写 JSDoc，说明**为什么**和**不要做什么**。
- 不要给显而易见的赋值加行内注释。
- 教程写在 `docs/`，不写在函数肚子里。

## 密钥

见 [docs/keys.md](docs/keys.md)。`.dev.vars` 不入库。Issue / PR 里禁止贴真实 Key。
