# catalog

万象货架底稿。不是 npm 包。先读仓库 [docs/concepts.md](../docs/concepts.md)。

- 展示：Web `apps/web/src/catalog-engine/` 构建时读本目录 yaml，画出卡片和详情。
- 调用：`packages/gateway/src/catalog/seed.ts` 仍是网关接线。不要在 gateway 里建渲染引擎。

```
apps/web/src/catalog-engine/
  spec.ts       货架记录与路由
  load.ts       构建时 glob + 解析 yaml
  price.ts      标价摘要与卡片标签
  vendors.ts    厂商展示名
  VendorMark    厂商标
  Card.tsx      广场卡片
  Detail.tsx    详情（介绍 / 定价 / API / 试用）
  ApiDocs.tsx   嵌入式 API 示例
```

型号按**服务厂商**分夹，和广场 `vendor` id 一致。一厂商数十个模型、短名撞车时，路径就是主键：

`models/<vendor>/<model-id>.yaml`

| 厂商 id | 目录 |
|---|---|
| `myriad` | `models/myriad/` 自建 |
| `deepseek` | `models/deepseek/` |
| `qianwen` | `models/qianwen/` |
| `fal` | `models/fal/` |
| `volcengine` | `models/volcengine/` |

文件里写介绍、规格、对外标价、`vendor_model` 原串。不写密钥。同一物理型号被两家服务商上架，就两份文件；以后若要合并，用文件里的谱系字段，不靠文件名。

密钥见 `docs/信息存储/鉴权托管.md`。
